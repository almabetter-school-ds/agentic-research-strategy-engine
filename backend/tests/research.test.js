import request from "supertest";
import { createApp } from "../src/app.js";
import ResearchJob from "../src/models/ResearchJob.js";

test("protected research routes reject anonymous users", async () => {
  process.env.JWT_ACCESS_SECRET = "access-test-secret";
  process.env.JWT_REFRESH_SECRET = "refresh-test-secret";
  await request(createApp()).get("/api/research-jobs").expect(401);
});

test("research job model requires governed intake fields", async () => {
  const job = new ResearchJob({ question: "Short" });
  await expect(job.validate()).rejects.toThrow();
});
