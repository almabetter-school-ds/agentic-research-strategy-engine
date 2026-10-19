# Architecture

```mermaid
flowchart LR
  U[Consultant / Reviewer / Admin] --> FE[Next.js 15 Frontend]
  FE --> API[Express REST API]
  API --> AUTH[JWT + RBAC]
  API --> MONGO[(MongoDB Atlas)]
  API --> GRAPH[LangGraph Research Workflow]
  GRAPH --> PLANNER[Planner Agent]
  GRAPH --> BROWSER[Browser Agent]
  GRAPH --> EXTRACT[Extraction Agent]
  GRAPH --> VALIDATE[Validation Agent]
  GRAPH --> AGG[Aggregation Agent]
  GRAPH --> WRITER[Report Writer Agent]
  BROWSER --> TAVILY[Tavily Search]
  BROWSER --> FIRE[Firecrawl]
  BROWSER --> PW[Playwright]
  PLANNER --> DEEPSEEK[DeepSeek API]
  EXTRACT --> DEEPSEEK
  AGG --> DEEPSEEK
  WRITER --> DEEPSEEK
  WRITER --> QDRANT[(Qdrant Cloud)]
  API --> QDRANT
```

The backend is the workflow authority. The frontend never fabricates operational metrics; dashboards are MongoDB aggregations over jobs, evidence, sources, reports, validations, and audit logs.

## Governance

- Plans must be approved before execution.
- Evidence records preserve source relationships and confidence scores.
- Reviewers and admins can approve, reject, or flag evidence.
- Audit logs capture authentication, plan approvals, job creation, and evidence decisions.
- Knowledge memory stores validated findings locally and, when configured, in Qdrant collections.
