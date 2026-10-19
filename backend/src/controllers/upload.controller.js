import zlib from "node:zlib";
import KnowledgeMemory from "../models/KnowledgeMemory.js";
import UploadedFile from "../models/UploadedFile.js";

const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

export async function uploadFiles(req, res, next) {
  try {
    const files = req.files || [];
    if (!files.length) throw Object.assign(new Error("No files were provided"), { status: 400 });
    const created = [];
    for (const file of files) {
      if (!allowed.has(file.mimetype)) {
        created.push(await UploadedFile.create({ owner: req.user._id, originalName: file.originalname, mimeType: file.mimetype, size: file.size, status: "failed", metadata: { reason: "Unsupported file type" } }));
        continue;
      }
      const extractedText = extractFileText(file);
      const uploaded = await UploadedFile.create({
        owner: req.user._id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: extractedText ? "processed" : "uploaded",
        storageKey: `${Date.now()}-${file.originalname}`,
        metadata: {
          extractedCharacters: extractedText.length,
          extractedPreview: extractedText.slice(0, 500),
          extractionStatus: extractedText ? "completed" : "no readable text found"
        }
      });
      if (extractedText) {
        const memory = await KnowledgeMemory.create({
          collection: "market_insights",
          title: `Uploaded: ${file.originalname}`,
          content: extractedText.slice(0, 12000),
          tags: ["uploaded-file", file.mimetype.split("/").pop(), file.originalname.split(".").pop()?.toLowerCase()].filter(Boolean),
          confidence: 0.68
        });
        uploaded.metadata = { ...uploaded.metadata, knowledgeMemoryId: memory._id };
        await uploaded.save();
      }
      created.push(uploaded);
    }
    res.status(201).json({ files: created });
  } catch (err) {
    next(err);
  }
}

export async function listUploads(req, res, next) {
  try {
    res.json({ files: await UploadedFile.find({ owner: req.user._id, status: { $ne: "deleted" } }).sort({ createdAt: -1 }).limit(20) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUpload(req, res, next) {
  try {
    const file = await UploadedFile.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { status: "deleted" }, { new: true });
    if (!file) throw Object.assign(new Error("Uploaded file not found"), { status: 404 });
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

function extractFileText(file) {
  if (!file?.buffer?.length) return "";
  if (file.mimetype === "application/pdf") return extractPdfText(file.buffer);
  return normalizeExtractedText(file.buffer.toString("utf8") || file.buffer.toString("latin1"));
}

function extractPdfText(buffer) {
  const binary = buffer.toString("latin1");
  const candidates = [binary];
  const streamPattern = /(<<[\s\S]*?>>\s*)?stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamPattern.exec(binary))) {
    const dictionary = match[1] || "";
    const stream = Buffer.from(match[2], "latin1");
    if (dictionary.includes("/FlateDecode")) {
      try {
        candidates.push(zlib.inflateSync(stream).toString("latin1"));
      } catch {
        candidates.push(stream.toString("latin1"));
      }
    } else {
      candidates.push(stream.toString("latin1"));
    }
  }
  return normalizeExtractedText(candidates.map(extractPdfStrings).join(" "));
}

function extractPdfStrings(text) {
  const strings = [];
  const literalPattern = /\((?:\\.|[^\\()]){2,}\)/g;
  const hexPattern = /<([0-9A-Fa-f\s]{6,})>/g;
  let match;
  while ((match = literalPattern.exec(text))) strings.push(decodePdfLiteral(match[0].slice(1, -1)));
  while ((match = hexPattern.exec(text))) {
    const hex = match[1].replace(/\s+/g, "");
    const bytes = hex.match(/.{1,2}/g)?.map(value => parseInt(value, 16)).filter(value => Number.isFinite(value)) || [];
    strings.push(Buffer.from(bytes).toString("utf8"));
  }
  return strings.join(" ");
}

function decodePdfLiteral(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([()\\])/g, "$1");
}

function normalizeExtractedText(text = "") {
  return text
    .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);
}
