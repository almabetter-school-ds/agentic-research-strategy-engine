import mongoose from "mongoose";

const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  metadata: mongoose.Schema.Types.Mixed,
  ip: String
}, { timestamps: true });

schema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", schema);
