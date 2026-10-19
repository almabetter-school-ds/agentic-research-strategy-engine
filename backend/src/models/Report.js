import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({ title: String, body: String, evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: "EvidenceRecord" }] }, { _id: false });

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchJob", required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  outputType: String,
  sections: [sectionSchema],
  evidenceAppendix: [{ type: mongoose.Schema.Types.ObjectId, ref: "EvidenceRecord" }],
  status: { type: String, enum: ["draft", "in_review", "approved", "archived"], default: "draft", index: true },
  confidenceScore: { type: Number, min: 0, max: 1 },
  exports: [{ format: String, url: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

schema.index({ title: "text", "sections.body": "text" });

export default mongoose.model("Report", schema);
