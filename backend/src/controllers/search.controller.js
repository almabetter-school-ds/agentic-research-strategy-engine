import ResearchJob from "../models/ResearchJob.js";
import Report from "../models/Report.js";
import KnowledgeMemory from "../models/KnowledgeMemory.js";
import UploadedFile from "../models/UploadedFile.js";

export async function globalSearch(req, res, next) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ results: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const [jobs, reports, knowledge, files] = await Promise.all([
      ResearchJob.find({ owner: req.user._id, $or: [{ question: regex }, { industry: regex }, { competitors: regex }] }).limit(5),
      Report.find({ owner: req.user._id, title: regex }).limit(5),
      KnowledgeMemory.find({ $or: [{ title: regex }, { content: regex }, { tags: regex }] }).limit(5),
      UploadedFile.find({ owner: req.user._id, originalName: regex, status: "uploaded" }).limit(5)
    ]);
    res.json({
      results: [
        ...jobs.map(x => ({ id: x._id, type: "Research", title: x.question, subtitle: x.industry, href: "/workflow-monitor" })),
        ...reports.map(x => ({ id: x._id, type: "Report", title: x.title, subtitle: x.status, href: "/reports" })),
        ...knowledge.map(x => ({ id: x._id, type: "Insight", title: x.title, subtitle: x.collection, href: "/knowledge-base" })),
        ...files.map(x => ({ id: x._id, type: "File", title: x.originalName, subtitle: x.mimeType, href: "/data-sources" }))
      ]
    });
  } catch (err) {
    next(err);
  }
}
