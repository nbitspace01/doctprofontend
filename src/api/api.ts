import axiosInstance from "../pages/Common/axiosInstance";
import { AxiosError, AxiosRequestConfig } from "axios";

/* Common API Error */
export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
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

    if (config?.responseType === "blob") {
      return response.data as T;
    }

    const payload = response.data as any;
    const hasPaginationKeys =
      payload &&
      typeof payload === "object" &&
      (
        "meta" in payload ||
        "total" in payload ||
        "page" in payload ||
        "limit" in payload ||
        "totalPages" in payload
      );

    const normalized =
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      payload.data !== null &&
      !hasPaginationKeys
        ? payload.data
        : payload;

    return normalized as T;
  } catch (error) {
    const err = error as AxiosError<any>;

    const rawErrors = Array.isArray(err.response?.data?.errors)
      ? err.response?.data?.errors
      : [];
    const errors = rawErrors.map((e: any) => e?.message || String(e));

    const apiError: ApiError = {
      message: errors.length
        ? `${err.response?.data?.message || err.message || "Something went wrong"}: ${errors.join(" | ")}`
        : err.response?.data?.message || err.message || "Something went wrong",
      status: err.response?.status || 500,
      errors,
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

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>("PUT", url, data, config),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>("PATCH", url, data, config),

  delete: <T>(url: string, params?: Record<string, any>) =>
    request<T>("DELETE", url, undefined, { params }),
};
