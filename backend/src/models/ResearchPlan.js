import mongoose from "mongoose";

const schema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchJob", required: true, unique: true, index: true },
  goals: [{ type: String, required: true }],
  workstreams: [{
    name: String,
    objective: String,
    searchTasks: [String],
    sourceCategories: [String],
    evidenceRequirements: [String]
  }],
  validationCriteria: [String],
  status: { type: String, enum: ["draft", "approved", "regenerating"], default: "draft", index: true },
  generatedBy: { type: String, default: "Planner Agent" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date
}, { timestamps: true });

export default mongoose.model("ResearchPlan", schema);
