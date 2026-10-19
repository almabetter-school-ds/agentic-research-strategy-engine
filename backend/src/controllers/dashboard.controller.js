import EvidenceRecord from "../models/EvidenceRecord.js";
import KnowledgeMemory from "../models/KnowledgeMemory.js";
import ResearchJob from "../models/ResearchJob.js";
import Report from "../models/Report.js";
import Source from "../models/Source.js";
import AuditLog from "../models/AuditLog.js";
import ValidationResult from "../models/ValidationResult.js";
import UploadedFile from "../models/UploadedFile.js";

export async function dashboard(req, res, next) {
  try {
    const scope = req.user.role === "admin" ? {} : { owner: req.user._id };
    const jobs = await ResearchJob.find(scope).select("_id");
    const jobIds = jobs.map(j => j._id);
    const [activeJobs, completedReports, evidenceRecords, knowledgeBaseEntries, uploadedFiles, processedUploads, completedJobs, totalJobs, recentActivity, volume, uploadVolume, sourceQuality, validation, industries, competitors, reportConfidence, evidenceConfidence, knowledgeConfidence] = await Promise.all([
      ResearchJob.countDocuments({ ...scope, status: { $in: ["planning", "approved", "running", "review"] } }),
      Report.countDocuments(req.user.role === "admin" ? {} : { owner: req.user._id }),
      EvidenceRecord.countDocuments({ job: { $in: jobIds } }),
      KnowledgeMemory.countDocuments(),
      UploadedFile.countDocuments({ ...scope, status: { $ne: "deleted" } }),
      UploadedFile.countDocuments({ ...scope, status: "processed" }),
      ResearchJob.find({ ...scope, status: { $in: ["completed", "review"] }, runtimeMs: { $gt: 0 } }).select("runtimeMs"),
      ResearchJob.countDocuments(scope),
      AuditLog.find(req.user.role === "admin" ? {} : { actor: req.user._id }).sort({ createdAt: -1 }).limit(8),
      ResearchJob.aggregate([{ $match: scope }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, jobs: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      UploadedFile.aggregate([{ $match: { ...scope, status: { $ne: "deleted" } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, uploads: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Source.aggregate([{ $match: { job: { $in: jobIds } } }, { $group: { _id: "$sourceType", avgQuality: { $avg: "$qualityScore" }, count: { $sum: 1 } } }]),
      ValidationResult.aggregate([{ $match: { job: { $in: jobIds } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      ResearchJob.aggregate([{ $match: scope }, { $group: { _id: "$industry", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      ResearchJob.aggregate([{ $match: scope }, { $unwind: "$competitors" }, { $group: { _id: "$competitors", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Report.aggregate([{ $match: req.user.role === "admin" ? { confidenceScore: { $ne: null } } : { owner: req.user._id, confidenceScore: { $ne: null } } }, { $group: { _id: null, avg: { $avg: "$confidenceScore" } } }]),
      EvidenceRecord.aggregate([{ $match: { job: { $in: jobIds } } }, { $group: { _id: null, avg: { $avg: "$confidence" } } }]),
      KnowledgeMemory.aggregate([{ $match: { confidence: { $ne: null } } }, { $group: { _id: null, avg: { $avg: "$confidence" } } }])
    ]);
    const confidenceSource = reportConfidence[0]?.avg ?? evidenceConfidence[0]?.avg ?? knowledgeConfidence[0]?.avg;
    const dataSources = [
      { name: "DeepSeek", configured: Boolean(process.env.DEEPSEEK_API_KEY) },
      { name: "Tavily", configured: Boolean(process.env.TAVILY_API_KEY) },
      { name: "Firecrawl", configured: Boolean(process.env.FIRECRAWL_API_KEY) },
      { name: "Qdrant", configured: Boolean(process.env.QDRANT_URL && process.env.QDRANT_API_KEY) },
      { name: "MongoDB", configured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URL) },
      { name: "Uploaded Files", configured: uploadedFiles > 0, count: uploadedFiles, processed: processedUploads }
    ];
    res.json({
      metrics: {
        activeJobs,
        marketOpportunities: knowledgeBaseEntries,
        emergingTrends: industries.length,
        competitorsMonitored: competitors.length,
        completedReports,
        reportsGenerated: completedReports,
        evidenceRecords,
        knowledgeBaseEntries,
        uploadedFiles,
        processedUploads,
        sentimentScore: confidenceSource == null ? null : Math.round(confidenceSource * 100),
        dataSourcesConnected: dataSources.filter(x => x.configured).length,
        researchSuccessRate: totalJobs ? completedJobs.length / totalJobs : 0,
        averageRuntimeMs: completedJobs.length ? completedJobs.reduce((s, j) => s + j.runtimeMs, 0) / completedJobs.length : 0
      },
      charts: { volume, uploadVolume, sourceQuality, validation, industries, competitors },
      dataSources,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
}

export async function operations(req, res, next) {
  try {
    const [totalResearchJobs, failedJobs, validationFailures, avgRuntime, topIndustries, topCompetitors, sourceQuality] = await Promise.all([
      ResearchJob.countDocuments(),
      ResearchJob.countDocuments({ status: "failed" }),
      ValidationResult.countDocuments({ status: { $in: ["failed", "conflict"] } }),
      ResearchJob.aggregate([{ $match: { runtimeMs: { $gt: 0 } } }, { $group: { _id: null, avgRuntime: { $avg: "$runtimeMs" } } }]),
      ResearchJob.aggregate([{ $group: { _id: "$industry", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      ResearchJob.aggregate([{ $unwind: "$competitors" }, { $group: { _id: "$competitors", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Source.aggregate([{ $group: { _id: "$sourceType", score: { $avg: "$qualityScore" }, count: { $sum: 1 } } }])
    ]);
    res.json({ totalResearchJobs, avgRuntimeMs: avgRuntime[0]?.avgRuntime || 0, failedJobs, validationFailures, sourceQuality, topIndustries, topCompetitors });
  } catch (err) {
    next(err);
  }
}
