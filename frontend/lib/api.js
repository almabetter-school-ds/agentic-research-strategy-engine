import axios from "axios";

const LOCAL_API_BASE_URL = "http://localhost:8080/api";
const HOSTED_API_BASE_URL = "/api";

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalApiURL(value) {
  try {
    const url = new URL(value, "http://localhost");
    return isLocalHostname(url.hostname);
  } catch {
    return false;
  }
}

export function getDefaultApiBaseURL(hostname = typeof window !== "undefined" ? window.location.hostname : "") {
  return isLocalHostname(hostname) ? LOCAL_API_BASE_URL : HOSTED_API_BASE_URL;
}

export function resolveApiBaseURL(
  baseURL = process.env.NEXT_PUBLIC_API_URL,
  defaultBaseURL = getDefaultApiBaseURL(),
  hostname = typeof window !== "undefined" ? window.location.hostname : ""
) {
  const value = (baseURL || defaultBaseURL).trim().replace(/\/+$/, "");
  if (!value) return defaultBaseURL;

  // Local development should never silently call a previously deployed backend.
  if (isLocalHostname(hostname) && !value.startsWith("/") && !isLocalApiURL(value)) {
    return LOCAL_API_BASE_URL;
  }
  // Hosted browser builds should use the same-origin Next.js proxy when a local URL is accidentally configured.
  if (!isLocalHostname(hostname) && isLocalApiURL(value)) return HOSTED_API_BASE_URL;

  try {
    const url = new URL(value, "http://localhost");
    const pathname = url.pathname.replace(/\/+$/, "");
    if (pathname === "/api" || pathname.startsWith("/api/")) return value;
  } catch {
    if (value === "/api" || value.startsWith("/api/")) return value;
  }
  return `${value}/api`;
}

export const api = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 90000
});

api.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const details = error.response?.data?.details;
    const detailMessage = Array.isArray(details)
      ? details.map(detail => detail.message).filter(Boolean).join(" ")
      : "";
    const message = detailMessage || formatServerErrorMessage(error.response?.data?.message) || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

function formatServerErrorMessage(message) {
  if (!message) return "";
  try {
    const issues = JSON.parse(message);
    if (Array.isArray(issues)) return issues.map(issue => issue.message).filter(Boolean).join(" ");
  } catch {
    // Keep non-JSON backend messages as-is.
  }
  return message;
}
