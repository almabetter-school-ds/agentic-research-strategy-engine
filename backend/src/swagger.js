
const success = (description = "Request completed successfully") => ({
  description,
  content: {
    "application/json": {
      schema: { type: "object", additionalProperties: true },
    },
  },
});

const pathParam = (name) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});

const operation = (summary, tag, options = {}) => {
  const result = {
    tags: [tag],
    summary,
    responses: {
      200: success(),
      201: success("Resource created"),
      202: success("Workflow step accepted"),
      400: { description: "Invalid request" },
      401: { description: "Authentication required or token invalid" },
      403: { description: "Insufficient permissions" },
      404: { description: "Resource not found" },
      500: { description: "Unexpected server error" },
    },
    security: options.public ? [] : [{ bearerAuth: [] }],
  };

  if (options.params) result.parameters = options.params.map(pathParam);

  if (options.query) {
    result.parameters = [
      ...(result.parameters || []),
      ...options.query.map((name) => ({
        name,
        in: "query",
        required: false,
        schema: { type: "string" },
      })),
    ];
  }

  if (options.body) {
    result.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", additionalProperties: true },
        },
      },
    };
  }

  if (options.upload) {
    result.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: { type: "string", format: "binary" },
              },
            },
            required: ["files"],
          },
        },
      },
    };
  }

  return result;
};

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "McKinsey AI Market Research & Strategy Engine API",
    version: "1.0.0",
    description:
      "Interactive documentation for the Express API. Protected endpoints require a bearer access token obtained from login or signup.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local backend",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Paste the access token returned by login or signup.",
      },
    },
  },
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Research" },
    { name: "Reports" },
    { name: "Dashboard" },
    { name: "Knowledge" },
    { name: "Uploads" },
    { name: "Notifications" },
    { name: "AI Assistant" },
    { name: "Search" },
  ],
  paths: {
    "/health": {
      get: operation("Check API health", "Health", { public: true }),
    },
    "/api/auth/signup": {
      post: operation("Create an account", "Auth", {
        public: true,
        body: true,
      }),
    },
    "/api/auth/login": {
      post: operation("Log in and receive tokens", "Auth", {
        public: true,
        body: true,
      }),
    },
    "/api/auth/refresh": {
      post: operation("Refresh an access token", "Auth", {
        public: true,
        body: true,
      }),
    },
    "/api/auth/me": {
      get: operation("Get the current user's profile", "Auth"),
    },
    "/api/research-jobs": {
      post: operation("Create a research job", "Research", { body: true }),
      get: operation("List accessible research jobs", "Research", {
        query: ["limit", "status"],
      }),
    },
    "/api/research-jobs/{id}": {
      get: operation("Get a research job", "Research", {
        params: ["id"],
      }),
    },
    "/api/evidence": {
      get: operation("List evidence for reviewer or admin", "Research", {
        query: ["status", "limit"],
      }),
    },
    "/api/evidence/{id}/review": {
      patch: operation("Review an evidence record", "Research", {
        params: ["id"],
        body: true,
      }),
    },
    "/api/research-plan": {
      post: operation("Create or regenerate a research plan", "Research", {
        body: true,
      }),
    },
    "/api/research-jobs/{jobId}/approve-plan": {
      post: operation("Approve a research plan", "Research", {
        params: ["jobId"],
      }),
    },
    "/api/research-jobs/{jobId}/run": {
      post: operation("Execute an approved research workflow", "Research", {
        params: ["jobId"],
      }),
    },
    "/api/browse": {
      post: operation("Submit the browse workflow step", "Research", {
        body: true,
      }),
    },
    "/api/extract": {
      post: operation("Submit the extraction workflow step", "Research", {
        body: true,
      }),
    },
    "/api/validate": {
      post: operation("Submit the validation workflow step", "Research", {
        body: true,
      }),
    },
    "/api/aggregate": {
      post: operation("Submit the aggregation workflow step", "Research", {
        body: true,
      }),
    },
    "/api/generate-report": {
      post: operation("Submit the report-generation workflow step", "Research", {
        body: true,
      }),
    },
    "/api/feedback": {
      post: operation("Submit research feedback", "Research", {
        body: true,
      }),
    },
    "/api/reports": {
      get: operation("List accessible reports", "Reports"),
    },
    "/api/reports/{id}": {
      get: operation("Get a report", "Reports", { params: ["id"] }),
    },
    "/api/reports/{id}/export/{format}": {
      get: operation("Export a report", "Reports", {
        params: ["id", "format"],
      }),
    },
    "/api/reports/feedback": {
      post: operation("Submit report feedback", "Reports", {
        body: true,
      }),
    },
    "/api/dashboard": {
      get: operation("Get dashboard metrics", "Dashboard", {
        query: ["days"],
      }),
    },
    "/api/dashboard/operations": {
      get: operation("Get admin operations metrics", "Dashboard"),
    },
    "/api/knowledge": {
      get: operation("List knowledge records or search semantically", "Knowledge", {
        query: ["q", "collection", "industry", "geography", "tag", "limit"],
      }),
      post: operation("Create a knowledge record", "Knowledge", {
        body: true,
      }),
    },
    "/api/uploads": {
      get: operation("List uploaded files", "Uploads"),
      post: operation("Upload files", "Uploads", { upload: true }),
    },
    "/api/uploads/{id}": {
      delete: operation("Delete an uploaded file", "Uploads", {
        params: ["id"],
      }),
    },
    "/api/notifications": {
      get: operation("List notifications", "Notifications"),
    },
    "/api/notifications/read-all": {
      patch: operation("Mark all notifications as read", "Notifications"),
    },
    "/api/notifications/{id}/read": {
      patch: operation("Mark a notification as read", "Notifications", {
        params: ["id"],
      }),
    },
    "/api/assistant/chat": {
      post: operation("Ask the AI assistant a question", "AI Assistant", {
        body: true,
      }),
    },
    "/api/assistant/analyze": {
      post: operation("Generate structured analysis", "AI Assistant", {
        body: true,
      }),
    },
    "/api/search": {
      get: operation("Search accessible project records", "Search", {
        query: ["q"],
      }),
    },
  },
};

export default openApiSpec;
