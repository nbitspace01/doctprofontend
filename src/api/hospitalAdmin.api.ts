import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// -----Create Hospital Admin API -----
export const createHospitalAdminApi = (data: any) => {
  return apiClient.post<any>(`/api/hospital-admin/register`, data);
}

// Fetch Hospital Admin List
export const fetchHospitalAdmin = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  // const url = `/api/dashboard/hospital-admin/list?page=${page}&limit=${limit}${
    const url = `/api/hospital-admin/list?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// ----- Update Hospital By ID API -----
export const updateHospitalAdminApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/hospital-admin/${id}`, data);
};

// Hospital Admin Status Update API
export const updateHospitalAdminStatusApi = (id: string, status: string) => {
  return apiClient.put<any>(`/api/hospital-admin/${id}/status`, { status });
};

// ----- Fetch Hospital By ID API -----
export const fetchHospitalAdminByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/hospital-admin/${id}`);
};

// ----- Delete Hospital API -----
export const deleteHospitalAdminApi = (id: string) => {
  return apiClient.delete<any>(`/api/hospital-admin/${id}`);
};

//----- Fetch Hospital List API(ID and Name Only) -----
export const fetchHospitalAdminListApi = () =>{
  return apiClient.get<any>(`/api/hospital-admin/list`);
}