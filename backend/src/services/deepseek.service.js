const DEFAULT_MODEL = "deepseek-v4-flash";
function timeoutMs() { return Number(process.env.DEEPSEEK_TIMEOUT_MS || 60000); }
function maxRetries() { return Math.max(0, Math.min(4, Number(process.env.DEEPSEEK_MAX_RETRIES ?? 2))); }
function modelList() {
  return [...new Set([process.env.DEEPSEEK_MODEL || DEFAULT_MODEL, ...(process.env.DEEPSEEK_MODEL_FALLBACKS || "").split(",").map(value => value.trim()).filter(Boolean)])];
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function providerError(message, status = 502, code = "AI_PROVIDER_ERROR", details = {}) {
  return Object.assign(new Error(message), { status, code, details: { provider: "deepseek", ...details } });
}

function retryable(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function retryDelay(response, attempt) {
  const headerSeconds = Number(response?.headers?.get("retry-after") || 0);
  return headerSeconds > 0 ? Math.min(headerSeconds * 1000, 10000) : Math.min(600 * (2 ** attempt), 5000);
}

async function requestCompletion(prompt, jsonMode = false) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw providerError("DeepSeek API key is not configured. Set DEEPSEEK_API_KEY in backend/.env or Render environment variables.", 503, "AI_NOT_CONFIGURED");
  }

  let lastError;
  const models = modelList();
  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex];
    for (let attempt = 0; attempt <= maxRetries(); attempt += 1) {
    let response;
    try {
      response = await fetch(process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
          thinking: { type: "disabled" },
          temperature: 0.2,
          max_tokens: Number(process.env.DEEPSEEK_MAX_TOKENS || 8192),
          ...(jsonMode ? { response_format: { type: "json_object" } } : {})
        }),
        signal: AbortSignal.timeout(timeoutMs())
      });
    } catch (err) {
      const timedOut = err?.name === "TimeoutError" || err?.name === "AbortError";
      lastError = providerError(
        timedOut ? `DeepSeek request timed out after ${timeoutMs()} ms.` : "Unable to reach the DeepSeek API. Check the network connection and try again.",
        timedOut ? 504 : 502,
        timedOut ? "AI_TIMEOUT" : "AI_NETWORK_ERROR"
      );
      if (attempt < maxRetries()) {
        await sleep(Math.min(600 * (2 ** attempt), 5000));
        continue;
      }
      throw lastError;
    }

    const rawBody = await response.text();
    let payload = {};
    try { payload = rawBody ? JSON.parse(rawBody) : {}; } catch { /* handled below */ }

    if (!response.ok) {
      const apiMessage = String(payload?.error?.message || payload?.message || `HTTP ${response.status}`);
      const isQuota = response.status === 402 || response.status === 429 || /insufficient balance|quota|rate.?limit|too many requests/i.test(apiMessage);
      lastError = providerError(
        isQuota ? "DeepSeek API quota, rate limit, or balance limit was reached." : `DeepSeek API request failed (${response.status}).`,
        response.status === 401 || response.status === 403 ? 503 : response.status,
        isQuota ? "AI_QUOTA_EXCEEDED" : "AI_PROVIDER_ERROR",
        { httpStatus: response.status, model, retryable: retryable(response.status) }
      );
      if (attempt < maxRetries() && retryable(response.status)) {
        await sleep(retryDelay(response, attempt));
        continue;
      }
      if (response.status === 404 && modelIndex < models.length - 1) break;
      throw lastError;
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw providerError("DeepSeek returned an empty or unexpected response.", 502, "AI_INVALID_RESPONSE");
    }
    return content.trim();
    }
  }
  throw lastError || providerError("DeepSeek request failed.");
}

function cleanJsonText(value = "") {
  let text = String(value).trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = Math.min(...["{", "["].map(char => {
    const index = text.indexOf(char);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  }));
  const last = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (Number.isFinite(first) && last > first) text = text.slice(first, last + 1);
  return text;
}

export async function generateJson(prompt, fallback) {
  const text = cleanJsonText(await requestCompletion(`${prompt}\nReturn valid JSON only. Do not wrap it in markdown.`, true));
  try {
    return JSON.parse(text);
  } catch {
    if (fallback) return fallback(text);
    throw providerError("DeepSeek returned invalid JSON for a structured response.", 502, "AI_INVALID_JSON");
  }
}

export async function generateText(prompt) {
  return requestCompletion(prompt, false);
}

export function shouldUseAiFallback(err) {
  return ["AI_QUOTA_EXCEEDED", "AI_NETWORK_ERROR", "AI_TIMEOUT", "AI_PROVIDER_ERROR"].includes(err?.code)
    || [408, 425, 429, 500, 502, 503, 504].includes(Number(err?.status))
    || /quota|rate.?limit|insufficient balance|too many requests|temporarily unavailable/i.test(err?.message || "");
}
