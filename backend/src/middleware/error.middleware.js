import { ZodError } from "zod";

export function notFound(req, res, next) {
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { status: 404 }));
}

export function errorHandler(err, _req, res, _next) {
  const isValidationError = err instanceof ZodError;
  const status = isValidationError ? 400 : err.status || err.statusCode || 500;
  if (err.retryAfterSeconds) res.setHeader("Retry-After", String(Math.ceil(err.retryAfterSeconds)));
  res.status(status).json({
    error: isValidationError ? "ValidationError" : err.name || "ApplicationError",
    message: isValidationError ? "Please check the highlighted fields and try again." : err.message || "Unexpected server error",
    details: isValidationError ? formatZodDetails(err) : err.details,
    retryAfterSeconds: err.retryAfterSeconds
  });
}

function formatZodDetails(err) {
  return err.issues.map(issue => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}
