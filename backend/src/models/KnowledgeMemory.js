import mongoose from "mongoose";

const schema = new mongoose.Schema({
  collection: { type: String, enum: ["market_insights", "competitor_insights", "trend_analysis", "research_reports"], required: true, index: true },
  sourceEvidence: [{ type: mongoose.Schema.Types.ObjectId, ref: "EvidenceRecord" }],
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  industry: { type: String, index: true },
  geography: { type: String, index: true },
  competitors: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  qdrantPointId: { type: String, index: true },
  confidence: { type: Number, min: 0, max: 1, default: 0.7 }
}, { timestamps: true, suppressReservedKeysWarning: true });

schema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("KnowledgeMemory", schema);
