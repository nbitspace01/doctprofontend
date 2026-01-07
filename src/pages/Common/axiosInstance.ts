import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor with improved token handling
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("userToken");
    let retries = 0;
    const maxRetries = 5;

    // If token is not found, retry with increasing delays
    while (!token && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100 * (retries + 1)));
      token = localStorage.getItem("userToken");
      retries++;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        "No token found after retries, request will proceed without authorization"
      );
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log(
        "Unauthorized access, clearing localStorage and redirecting to login"
      );
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("roleId");
      localStorage.removeItem("roleName");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");

      // Use window.location for more reliable redirect
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
