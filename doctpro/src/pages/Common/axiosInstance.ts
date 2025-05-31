import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || !localStorage.getItem("authToken")) {
      // Clear any existing auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      // Redirect to login page
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
