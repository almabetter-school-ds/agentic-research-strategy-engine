import { getDefaultApiBaseURL, resolveApiBaseURL } from "../lib/api";

test("keeps API proxy URLs that already include /api", () => {
  expect(resolveApiBaseURL("/api")).toBe("/api");

  expect(
    resolveApiBaseURL(
      "https://example.onrender.com/api",
      "/api",
      "project.vercel.app"
    )
  ).toBe("https://example.onrender.com/api");

  expect(
    resolveApiBaseURL(
      "https://example.onrender.com/api/",
      "/api",
      "project.vercel.app"
    )
  ).toBe("https://example.onrender.com/api");
});

test("adds /api when a backend origin is configured", () => {
  expect(resolveApiBaseURL("https://example.onrender.com", "https://example.onrender.com/api", "demo.vercel.app"))
    .toBe("https://example.onrender.com/api");
});

test("uses the local backend API for local browser hosts", () => {
  expect(getDefaultApiBaseURL("localhost")).toBe("http://localhost:8080/api");
  expect(getDefaultApiBaseURL("127.0.0.1")).toBe("http://localhost:8080/api");
});

test("hosted builds default to the same-origin API proxy", () => {
  expect(getDefaultApiBaseURL("strategy-engine-demo.vercel.app")).toBe("/api");
  expect(resolveApiBaseURL("", "/api", "strategy-engine-demo.vercel.app")).toBe("/api");
});

test("local development does not silently call a previously deployed backend", () => {
  expect(resolveApiBaseURL("https://old-project.onrender.com/api", "/api", "localhost"))
    .toBe("http://localhost:8080/api");
});

test("hosted builds do not use accidental localhost API values", () => {
  expect(resolveApiBaseURL("http://localhost:8080/api", "/api", "strategy-engine-demo.vercel.app")).toBe("/api");
});
