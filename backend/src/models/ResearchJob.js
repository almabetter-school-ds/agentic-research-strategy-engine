import mongoose from "mongoose";

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: String, required: true, trim: true },
  industry: { type: String, required: true, index: true },
  geography: { type: String, required: true, index: true },
  timeframe: { type: String, required: true },
  competitors: [{ type: String, trim: true, index: true }],
  outputType: { type: String, enum: ["Market Entry Scan", "Competitor Landscape", "Trend Analysis", "Opportunity Assessment", "Proposal Support"], required: true, index: true },
  status: { type: String, enum: ["intake", "planning", "approved", "running", "review", "completed", "failed"], default: "intake", index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  currentStep: { type: String, default: "Intake" },
  error: String,
  startedAt: Date,
  completedAt: Date,
  runtimeMs: Number,
  logs: [{
    stage: String,
    message: String,
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

schema.index({ question: "text", industry: "text", geography: "text", competitors: "text" });
schema.index({ status: 1, updatedAt: -1 });

export default mongoose.model("ResearchJob", schema);
