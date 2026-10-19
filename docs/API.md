# API Routes

## Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Research

- `POST /api/research-jobs`
- `GET /api/research-jobs`
- `GET /api/research-jobs/:id`
- `POST /api/research-plan`
- `POST /api/research-jobs/:jobId/approve-plan`
- `POST /api/research-jobs/:jobId/run`
- `POST /api/browse`
- `POST /api/extract`
- `POST /api/validate`
- `POST /api/aggregate`
- `POST /api/generate-report`

## Reports

- `GET /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports/feedback`

## Dashboard

- `GET /api/dashboard`
- `GET /api/dashboard/operations`

## Knowledge

- `GET /api/knowledge`
- `POST /api/knowledge`
