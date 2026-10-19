import bcrypt from "bcrypt";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["consultant", "reviewer", "admin"], default: "consultant", index: true },
  isActive: { type: Boolean, default: true, index: true },
  preferences: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    defaultGeography: String,
    defaultIndustry: String
  },
  apiSettings: {
    deepseekConfigured: { type: Boolean, default: false },
    tavilyConfigured: { type: Boolean, default: false },
    firecrawlConfigured: { type: Boolean, default: false },
    qdrantConfigured: { type: Boolean, default: false }
  },
  refreshTokenHash: { type: String, select: false }
}, { timestamps: true });

schema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

schema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", schema);
