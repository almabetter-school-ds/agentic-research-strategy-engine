import mongoose from "mongoose";

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchJob", required: true, index: true },
  evidence: { type: mongoose.Schema.Types.ObjectId, ref: "EvidenceRecord", required: true, index: true },
  credibility: { type: Number, min: 0, max: 1 },
  recency: { type: Number, min: 0, max: 1 },
  duplicateRisk: { type: Number, min: 0, max: 1 },
  contradictionRisk: { type: Number, min: 0, max: 1 },
  status: { type: String, enum: ["passed", "failed", "conflict"], required: true, index: true },
  rationale: String
}, { timestamps: true });

export default mongoose.model("ValidationResult", schema);
