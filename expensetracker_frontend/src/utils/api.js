import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/",
});

// Add request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token if expired
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
        // 👇 use the same baseURL (no localhost hardcoding!)
        const res = await axios.post(
          `${api.defaults.baseURL}token/refresh/`,
          {
            refresh: localStorage.getItem("refresh_token"),
          }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // retry with new token
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Optionally redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
