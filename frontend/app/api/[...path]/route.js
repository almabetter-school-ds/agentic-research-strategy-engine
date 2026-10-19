const DEFAULT_API_ORIGIN = "http://localhost:8080";

function getBackendApiBaseURL() {
  const configuredURL = (process.env.API_URL || DEFAULT_API_ORIGIN).trim().replace(/\/+$/, "");
  if (!configuredURL || configuredURL.startsWith("/")) return `${DEFAULT_API_ORIGIN}/api`;
  return configuredURL.endsWith("/api") ? configuredURL : `${configuredURL}/api`;
}

function getTargetURL(request, path = []) {
  const requestURL = new URL(request.url);
  const targetPath = path.map(segment => encodeURIComponent(segment)).join("/");
  return `${getBackendApiBaseURL()}/${targetPath}${requestURL.search}`;
}

function getProxyRequestHeaders(request) {
  const headers = new Headers(request.headers);
  [
    "accept-encoding",
    "connection",
    "content-length",
    "host",
    "origin",
    "referer",
    "transfer-encoding"
  ].forEach(header => headers.delete(header));
  return headers;
}

function getProxyResponseHeaders(response) {
  const headers = new Headers(response.headers);
  [
    "content-encoding",
    "content-length",
    "connection",
    "transfer-encoding"
  ].forEach(header => headers.delete(header));
  return headers;
}

async function proxy(request, context) {
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const params = await context.params;
  const response = await fetch(getTargetURL(request, params?.path), {
    method,
    headers: getProxyRequestHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual"
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: getProxyResponseHeaders(response)
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
