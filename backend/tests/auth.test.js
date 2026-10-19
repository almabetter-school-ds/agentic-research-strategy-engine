import User from "../src/models/User.js";
import { resolvePublicSignupRole } from "../src/controllers/auth.controller.js";

test("user password hashing and verification", async () => {
  const user = new User({ name: "Ada Lovelace", email: "ada@example.com" });
  await user.setPassword("Password123!");
  expect(user.passwordHash).not.toBe("Password123!");
  await expect(user.verifyPassword("Password123!")).resolves.toBe(true);
  await expect(user.verifyPassword("wrong-password")).resolves.toBe(false);
});

test("user role defaults to consultant", () => {
  const user = new User({ name: "Grace Hopper", email: "grace@example.com", passwordHash: "hash" });
  expect(user.role).toBe("consultant");
});

test("public signup only creates consultant accounts", () => {
  expect(resolvePublicSignupRole()).toBe("consultant");
  expect(resolvePublicSignupRole("consultant")).toBe("consultant");
  expect(() => resolvePublicSignupRole("reviewer")).toThrow("Only consultant accounts can be created from public signup");
  expect(() => resolvePublicSignupRole("admin")).toThrow("Only consultant accounts can be created from public signup");
});
