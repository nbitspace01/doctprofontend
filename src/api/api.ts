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
  config?: AxiosRequestConfig
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

    throw {
      message:
        err.response?.data?.message ||
        err.message ||
        "Something went wrong",
      status: err.response?.status || 500,
    } as ApiError;
  }
};

/* Exposed API Methods */
export const apiClient = {
  get: <T>(url: string, params?: unknown) =>
    request<T>("GET", url, undefined, { params }),

  post: <T>(url: string, data?: unknown) =>
    request<T>("POST", url, data),

  put: <T>(url: string, data?: unknown) =>
    request<T>("PUT", url, data),

  patch: <T>(url: string, data?: unknown) =>
    request<T>("PATCH", url, data),

  delete: <T>(url: string, params?: unknown) =>
    request<T>("DELETE", url, undefined, { params }),
};
