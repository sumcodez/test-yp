// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/",               // Next.js proxy endpoints (same origin)
  withCredentials: true,      // send HttpOnly cookies
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (err: any) => void;
  config: any;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalConfig = error.config;

    if (!originalConfig) return Promise.reject(error);

    // If 401 and request not already retried
    if (error.response?.status === 401 && !originalConfig._retry) {
      // Avoid infinite loops for auth endpoints
      const isAuthEndpoint = originalConfig.url?.startsWith("/api/auth");
      if (isAuthEndpoint) {
        // Let auth endpoints handle their own responses (don't try refresh here)
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // queue the request to be retried after refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        }).then(() => api(originalConfig));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // Attempt refresh (server should read refresh cookie and set new cookies)
        await api.post("/api/auth/refresh");
        isRefreshing = false;
        processQueue(null);
        return api(originalConfig); // retry original request
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        // optional: redirect to login (client code can handle)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
