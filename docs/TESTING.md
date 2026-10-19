# Testing

Backend tests are offline-safe and cover:

- password hashing and verification
- role defaults
- protected route rejection
- research job model validation

Run:

```bash
cd backend
npm test
```

Frontend tests cover reusable UI rendering and are configured through `next/jest`.

Run:

```bash
cd frontend
npm test
```

Full integration testing against real workflow execution requires configured MongoDB Atlas, DeepSeek, Tavily, Firecrawl, and Qdrant credentials.
