import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
}

export async function signRefreshToken(user) {
  const token = jwt.sign({ sub: user.id, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  });
  user.refreshTokenHash = await bcrypt.hash(token, 10);
  await user.save();
  return token;
}

export async function issueTokens(user) {
  return { accessToken: signAccessToken(user), refreshToken: await signRefreshToken(user) };
}
