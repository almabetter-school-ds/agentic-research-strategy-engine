# Deployment Guide

Keep the frontend and backend as separate services. Deploy the backend from `backend/` to Render and the frontend from `frontend/` to Vercel.

## Local prerequisites

- Node.js 20.x for the backend and Node.js 24.x for the frontend as currently declared in their package manifests.
- MongoDB Atlas database user and connection URI.
- DeepSeek API key, Tavily API key, Firecrawl API key, and Qdrant endpoint/API key.
- Chromium dependencies for Playwright on the backend host. Confirm the host can install/run Playwright Chromium before the first production research job.

## Local environment

1. Copy `backend/.env.example` to `backend/.env` and fill in the values locally. Generate separate JWT secrets, e.g. `openssl rand -hex 32`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Start MongoDB Atlas network access with least privilege. Do not use the Atlas admin account in the application's connection URI.
4. Never commit `.env` or `.env.local` files.

## Backend on Render

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`
- Set `NODE_ENV=production` and all backend secrets/configuration from `backend/.env.example` in Render's Environment page. `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DEEPSEEK_API_KEY`, and `TAVILY_API_KEY` are required for the core flow. Configure Firecrawl and Qdrant as well to preserve the supplied service integrations.
- Set `CORS_ORIGIN` to the exact deployed Vercel origin (scheme + hostname only, no path); add comma-separated origins only when required.

## Frontend on Vercel

- Root directory: `frontend`
- Framework: Next.js
- Build command: `npm run build`
- Environment variables:
  - `NEXT_PUBLIC_API_URL=/api`
  - `API_URL=https://YOUR-NEW-RENDER-SERVICE.onrender.com` (no trailing slash and no `/api` suffix)

The frontend API route proxies browser requests to `API_URL`; this keeps the backend URL configuration in the server environment.

## Post-deployment verification

1. Open `https://YOUR-NEW-RENDER-SERVICE.onrender.com/health` and confirm `{"ok":true,...}`.
2. Load the Vercel frontend and sign up as a consultant.
3. Confirm a public request cannot self-assign `reviewer` or `admin` roles.
4. Create a research job; verify Tavily search, Firecrawl/Playwright retrieval, DeepSeek extraction/report writing, MongoDB persistence, Qdrant operations, report viewing, and exports.
5. Verify logs contain no API keys or database passwords.

## Important limitations

Retries help with temporary provider errors but cannot guarantee uninterrupted service. Render free services can cold start, provider API credits/balance can be exhausted, and Qdrant's free clusters may suspend after periods of inactivity. Use paid always-on hosting and appropriate service plans if the public demo needs stronger availability.
