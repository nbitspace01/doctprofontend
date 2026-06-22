import { apiClient } from "./api";

export const fetchReportsApi = async (params: {
  page?: number;
  limit?: number;
  searchValue?: string;
  filterValues?: any;
}) => {
  return apiClient.get<any>('/api/report/list', params);
};

export const deleteReportApi = async (id: string) => {
  return apiClient.delete<any>(`/api/report/${id}`);
};

export const fetchReportByIdApi = async (id: string) => {
  return apiClient.get<any>(`/api/report/${id}`);
};

export const updateReportStatusApi = async (id: string, status: string) => {
  return apiClient.put<any>(`/api/report/${id}/status`, { status });
};

export const deleteReportedPostApi = async (id: string) => {
  return apiClient.post<any>(`/api/report/${id}/delete-post`, {});
};

export const deleteReportedJobPostApi = async (id: string) => {
  return apiClient.post<any>(`/api/report/${id}/delete-job-post`, {});
};

export const exportReportsApi = async (params: Record<string, any> = {}) => {
  const query = new URLSearchParams(params as any).toString();
  const url = `/api/report/export${query ? `?${query}` : ""}`;
  return apiClient.get(url, { responseType: "blob" });
};
