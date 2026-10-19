import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["research", "report", "evidence", "system"], default: "system", index: true },
  relatedType: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  href: String,
  readAt: Date
}, { timestamps: true });

schema.index({ user: 1, readAt: 1, createdAt: -1 });

export default mongoose.model("Notification", schema);
