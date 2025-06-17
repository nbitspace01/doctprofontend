import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor with retry mechanism
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("userToken");
    let retries = 0;

    // If token is not found, retry up to 3 times with a small delay
    while (!token && retries < 3) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      token = localStorage.getItem("userToken");
      retries++;
    }

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
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("roleId");
      localStorage.removeItem("roleName");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
