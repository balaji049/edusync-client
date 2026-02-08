import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://edusync-server.onrender.com/api"
      : "/api",
});

/**
 * ⚠️ DO NOT attach Authorization header to LiveKit token requests
 */
API.interceptors.request.use((req) => {
  // Skip auth header for LiveKit
  if (!req.url?.includes("/livekit/token")) {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

export default API;
