import request from "supertest";
import { createApp } from "../src/app.js";

test("allows the configured deployed frontend origin", async () => {
  const original = process.env.CORS_ORIGIN;
  process.env.CORS_ORIGIN = "https://strategy-engine-demo.vercel.app";
  try {
    const app = createApp();
    const response = await request(app)
      .options("/api/auth/me")
      .set("Origin", "https://strategy-engine-demo.vercel.app")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "authorization");
    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://strategy-engine-demo.vercel.app");
  } finally {
    if (original === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = original;
  }
});

test("allows common local frontend dev ports", async () => {
  const app = createApp();
  const response = await request(app)
    .options("/api/auth/login")
    .set("Origin", "http://localhost:3001")
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "content-type");
  expect(response.status).toBe(204);
  expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
});
