// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000/api/',
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       localStorage.getItem("refreshToken")
//     ) {
//       originalRequest._retry = true;
//       try {
//         const refreshResponse = await axios.post(
//           'http://127.0.0.1:8000/api/token/refresh/',
//           {
//             refresh: localStorage.getItem('refreshToken'),
//           }
//         );

//         const newAccessToken = refreshResponse.data.access;
//         localStorage.setItem('accessToken', newAccessToken);

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // change to your backend
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

// Optional: auto-refresh token if expired
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
        const res = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: localStorage.getItem("refresh_token"),
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // retry with new token
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // Optionally redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
