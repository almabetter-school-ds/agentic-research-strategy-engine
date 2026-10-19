import Feedback from "../models/Feedback.js";
import Report from "../models/Report.js";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";

function reportScope(req, id) {
  return {
    _id: id,
    ...(req.user.role === "admin" ? {} : { owner: req.user._id })
  };
}

export async function listReports(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { owner: req.user._id };
    res.json({ reports: await Report.find(filter).populate("job").sort({ updatedAt: -1 }).limit(100) });
  } catch (err) {
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await Report.findOne(reportScope(req, req.params.id)).populate({ path: "evidenceAppendix", populate: "source" });
    if (!report) throw Object.assign(new Error("Report not found"), { status: 404 });
    res.json({ report });
  } catch (err) {
    next(err);
  }
}

export async function feedback(req, res, next) {
  try {
    const item = await Feedback.create({ ...req.body, user: req.user._id });
    res.status(201).json({ feedback: item });
  } catch (err) {
    next(err);
  }
}

export async function exportReport(req, res, next) {
  try {
    const report = await Report.findOne(reportScope(req, req.params.id)).populate({ path: "evidenceAppendix", populate: "source" });
    if (!report) throw Object.assign(new Error("Report not found"), { status: 404 });
    const body = report.sections.map(s => `${s.title}\n\n${s.body}`).join("\n\n");
    const appendix = report.evidenceAppendix.map(e => `- ${e.claim}\n  Source: ${e.source?.url || ""}\n  Confidence: ${Math.round(e.confidence * 100)}%`).join("\n");
    const format = req.params.format;
    if (format === "md" || format === "markdown") {
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-")}.md"`);
      return res.send(`# ${report.title}\n\n${report.sections.map(section => `## ${section.title}\n\n${section.body}`).join("\n\n")}\n\n## Evidence Appendix\n\n${appendix || "No evidence appendix records."}`);
    }
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-")}.csv"`);
      const rows = [["section", "body"], ...report.sections.map(section => [section.title, section.body])];
      return res.send(rows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n"));
    }
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-")}.pdf"`);
      const doc = new PDFDocument({ margin: 48 });
      doc.pipe(res);
      doc.fontSize(18).text(report.title, { underline: true });
      doc.moveDown();
      for (const section of report.sections) {
        doc.fontSize(14).text(section.title);
        doc.moveDown(0.3);
        doc.fontSize(10).text(section.body, { lineGap: 3 });
        doc.moveDown();
      }
      doc.fontSize(14).text("Evidence Appendix");
      doc.fontSize(9).text(appendix || "No evidence appendix records.");
      doc.end();
      return;
    }
    if (format !== "docx") throw Object.assign(new Error("Unsupported export format"), { status: 400 });
    const paragraphs = [
      new Paragraph({ children: [new TextRun({ text: report.title, bold: true, size: 32 })] }),
      ...report.sections.flatMap(section => [new Paragraph({ children: [new TextRun({ text: section.title, bold: true, size: 26 })] }), new Paragraph(section.body)]),
      new Paragraph({ children: [new TextRun({ text: "Evidence Appendix", bold: true, size: 26 })] }),
      ...appendix.split("\n").map(line => new Paragraph(line))
    ];
    const buffer = await Packer.toBuffer(new Document({ sections: [{ properties: {}, children: paragraphs }] }));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-")}.docx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
