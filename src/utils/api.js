// frontend/src/utils/api.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getStoredUserRole() {
  try {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser)?.role : null;
  } catch {
    return null;
  }
}

function getFetchMethod(input, init = {}) {
  if (init.method) return init.method.toUpperCase();
  if (input instanceof Request && input.method) return input.method.toUpperCase();
  return "GET";
}

function isApiRequest(input) {
  const rawUrl = typeof input === "string" ? input : input?.url;
  if (!rawUrl) return false;
  try {
    const targetUrl = new URL(rawUrl, window.location.origin);
    const apiUrl = new URL(API_BASE_URL, window.location.origin);
    return targetUrl.origin === apiUrl.origin && targetUrl.pathname.startsWith(apiUrl.pathname);
  } catch {
    return false;
  }
}

function installAuthenticatedFetch() {
  if (typeof window === "undefined" || window.__croscekFetchInstalled) return;

  const originalFetch = window.fetch.bind(window);
  window.__croscekFetchInstalled = true;

  window.fetch = async (input, init = {}) => {
    if (!isApiRequest(input)) {
      return originalFetch(input, init);
    }

    const method = getFetchMethod(input, init);
    const role = getStoredUserRole();

    if (role === "guest" && !["GET", "HEAD", "OPTIONS"].includes(method)) {
      window.alert("Akses guest hanya read-only dan export-only.");
      return new Response(JSON.stringify({ error: "Guest hanya boleh membaca data" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      return originalFetch(input, init);
    }

    const headers = new Headers(
      init.headers || (input instanceof Request ? input.headers : undefined)
    );
    headers.set("Authorization", `Bearer ${token}`);

    return originalFetch(input, { ...init, headers });
  };
}

installAuthenticatedFetch();

// Add JWT token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    const role = getStoredUserRole();

    if (
      role === "guest" &&
      config.method &&
      !["get", "head", "options"].includes(config.method.toLowerCase())
    ) {
      window.alert("Akses guest hanya read-only dan export-only.");
      return Promise.reject(new Error("Guest hanya boleh membaca data"));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors (auto logout if unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Legacy fetch-based API functions (untuk backward compatibility)
const API_URL = API_BASE_URL;

export async function apiFetchSchedules() {
  const res = await fetch(`${API_URL}/list`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
}

export async function apiUploadInformasi(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function apiUploadRosterPreview(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload-roster-preview`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload roster preview failed");
  return res.json();
}

export async function apiSaveRoster(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/save-roster`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Save roster failed");
  return res.json();
}

export async function apiUploadAttendancePreview(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload-attendance-preview`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload attendance preview failed");
  return res.json();
}

export async function apiSaveAttendance(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/save-attendance`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Save attendance failed");
  return res.json();
}

export async function apiRunCroscek() {
  const res = await fetch(`${API_URL}/croscek`);
  if (!res.ok) throw new Error("Croscek failed");
  return res.json();
}
