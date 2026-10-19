import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { audit } from "../utils/audit.js";
import { issueTokens, signAccessToken } from "../utils/tokens.js";

const signupSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), role: z.enum(["consultant", "reviewer", "admin"]).optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const DEFAULT_SIGNUP_ROLE = "consultant";

export function resolvePublicSignupRole(role) {
  if (role && role !== DEFAULT_SIGNUP_ROLE) {
    throw Object.assign(new Error("Only consultant accounts can be created from public signup"), { status: 403 });
  }
  return DEFAULT_SIGNUP_ROLE;
}

export async function signup(req, res, next) {
  try {
    const input = signupSchema.parse(req.body);
    const exists = await User.exists({ email: input.email.toLowerCase() });
    if (exists) throw Object.assign(new Error("Email is already registered"), { status: 409 });
    const user = new User({ name: input.name, email: input.email, role: resolvePublicSignupRole(input.role) });
    await user.setPassword(input.password);
    await user.save();
    await audit({ actor: user._id, action: "auth.signup", entityType: "User", entityId: user._id, ip: req.ip });
    res.status(201).json({ user: sanitize(user), tokens: await issueTokens(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash +refreshTokenHash");
    if (!user || !(await user.verifyPassword(input.password))) throw Object.assign(new Error("Invalid email or password"), { status: 401 });
    await audit({ actor: user._id, action: "auth.login", entityType: "User", entityId: user._id, ip: req.ip });
    res.json({ user: sanitize(user), tokens: await issueTokens(user) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
    res.json({ accessToken: signAccessToken(user) });
  } catch (err) {
    next(Object.assign(err, { status: 401 }));
  }
}

export async function me(req, res) {
  res.json({ user: sanitize(req.user) });
}

export function sanitize(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, preferences: user.preferences, apiSettings: user.apiSettings };
}
