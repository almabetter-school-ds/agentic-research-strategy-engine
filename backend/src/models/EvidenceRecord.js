import mongoose from "mongoose";

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchJob", required: true, index: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: "Source", required: true, index: true },
  claim: { type: String, required: true },
  excerpt: String,
  entity: { type: String, index: true },
  topic: { type: String, index: true },
  date: Date,
  confidence: { type: Number, min: 0, max: 1, required: true, index: true },
  validationStatus: { type: String, enum: ["pending", "approved", "rejected", "flagged"], default: "pending", index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date
}, { timestamps: true });

schema.index({ claim: "text", excerpt: "text", entity: "text", topic: "text" });

export default mongoose.model("EvidenceRecord", schema);
