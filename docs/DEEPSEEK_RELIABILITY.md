# DeepSeek API configuration and reliability

The backend uses DeepSeek's OpenAI-compatible Chat Completions endpoint through `src/services/deepseek.service.js`.

## Required configuration

- `DEEPSEEK_API_KEY`: API key created in the DeepSeek API platform (not a chat-only login/session token).
- `DEEPSEEK_MODEL`: defaults to `deepseek-v4-flash`. Confirm the model is enabled for the API account before deployment.
- `DEEPSEEK_TIMEOUT_MS`: request timeout; defaults to 60 seconds.
- `DEEPSEEK_MAX_RETRIES`: bounded retry count for temporary network, rate-limit, and server errors; defaults to 2 retries.
- `DEEPSEEK_MAX_TOKENS`: maximum completion tokens; defaults to 8192.

Structured JSON requests use `response_format: { "type": "json_object" }`. The application still validates/parses returned content and uses existing deterministic fallbacks only where implemented by the callers.

## Reliability notes

Retries reduce some transient failures but do not guarantee uninterrupted availability. Requests can still fail if the API key is invalid, the account has insufficient API balance, the model is unavailable, quotas/rate limits are reached for too long, or the provider has an outage. Review API usage and balance in the DeepSeek platform. A secondary AI provider would be required for provider-level failover, but this project does not enable an automatic secondary provider by default.

Do not print, commit, or paste `DEEPSEEK_API_KEY` in logs, tickets, screenshots, or GitHub. Store it in `backend/.env` locally and as a secret environment variable on Render in production.
