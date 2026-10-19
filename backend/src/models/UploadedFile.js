import mongoose from "mongoose";

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalName: { type: String, required: true },
  mimeType: String,
  size: { type: Number, required: true },
  status: { type: String, enum: ["uploaded", "processed", "failed", "deleted"], default: "uploaded", index: true },
  storageKey: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

schema.index({ originalName: "text" });
schema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("UploadedFile", schema);
