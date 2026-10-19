import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) throw Object.assign(new Error("Authentication token missing"), { status: 401 });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");
    if (!user || !user.isActive) throw Object.assign(new Error("User is not authorized"), { status: 401 });
    req.user = user;
    next();
  } catch (err) {
    next(Object.assign(err, { status: 401 }));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(Object.assign(new Error("Insufficient permissions"), { status: 403 }));
    }
    next();
  };
}
