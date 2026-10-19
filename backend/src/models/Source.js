import mongoose from "mongoose";

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchJob", required: true, index: true },
  url: { type: String, required: true },
  canonicalUrl: { type: String, required: true, index: true },
  title: String,
  publisher: { type: String, index: true },
  publishDate: Date,
  sourceType: { type: String, enum: ["news", "company", "report", "filing", "academic", "government", "other"], default: "other", index: true },
  snippet: String,
  content: String,
  retrievedAt: { type: Date, default: Date.now },
  qualityScore: { type: Number, min: 0, max: 1, default: 0.5 },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

schema.index({ job: 1, canonicalUrl: 1 }, { unique: true });
schema.index({ title: "text", snippet: "text", content: "text" });

export default mongoose.model("Source", schema);
