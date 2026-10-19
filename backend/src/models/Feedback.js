import mongoose from "mongoose";

const schema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  category: { type: String, enum: ["accuracy", "coverage", "format", "source_quality", "other"], default: "other", index: true }
}, { timestamps: true });

export default mongoose.model("Feedback", schema);
