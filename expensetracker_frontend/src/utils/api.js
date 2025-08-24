import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json", // ✅ Always send JSON
  },
});

// Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/"}token/refresh/`,
          { refresh: localStorage.getItem("refresh_token") },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // retry the original request
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);

        // ❌ Clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // 🔄 Redirect to login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
