import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";
import reportRoutes from "./routes/report.routes.js";
import researchRoutes from "./routes/research.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";
import searchRoutes from "./routes/search.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./swagger.js";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3010",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3010",
];

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN?.split(",").map(origin => origin.trim()).filter(Boolean) || [];
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]);
}

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(compression());
  const allowedOrigins = getAllowedOrigins();
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 120) }));

  app.get("/health", (_, res) => res.json({ ok: true, service: "market-research-engine" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/api-docs.json", (_, res) => res.json(openApiSpec));
  app.use("/api/auth", authRoutes);
  app.use("/api", researchRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/knowledge", knowledgeRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/search", searchRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
