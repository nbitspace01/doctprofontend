import axiosInstance from "../pages/Common/axiosInstance";
import { AxiosError, AxiosRequestConfig } from "axios";

/* Common API Error */
export interface ApiError {
  message: string;
  status: number;
}

/* Generic Request Function */
const request = async <T>(
  method: AxiosRequestConfig["method"],
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });

    return response.data as T;
  } catch (error) {
    const err = error as AxiosError<any>;

    const apiError: ApiError = {
      message:
        err.response?.data?.message || err.message || "Something went wrong",
      status: err.response?.status || 500,
    };

    throw apiError;
  }
};

/* Exposed API Methods */
export const apiClient = {
  get: <T>(url: string, params?: Record<string, any>) =>
    request<T>("GET", url, undefined, { params }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>("POST", url, data, config),

  put: <T>(url: string, data?: unknown) => request<T>("PUT", url, data),

  patch: <T>(url: string, data?: unknown) => request<T>("PATCH", url, data),

  delete: <T>(url: string, params?: Record<string, any>) =>
    request<T>("DELETE", url, undefined, { params }),
};
