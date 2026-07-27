import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// -----Create Clinic API -----
export const createClinicApi = (data: any) => {
  return apiClient.post<any>(`/api/clinics`, data);
};

// -----Fetch Clinics API -----
export const fetchClinicsApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/clinics?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// ----- Update Clinic By ID API -----
export const updateClinicApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/clinics/${id}`, data);
};

// ----- Fetch Clinic By ID API -----
export const fetchClinicByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/clinics/${id}`);
};

// ----- Delete Clinic API -----
export const deleteClinicApi = (id: string) => {
  return apiClient.delete<any>(`/api/clinics/${id}`);
};

//----- Fetch Clinic List API (ID and Name Only) -----
export const fetchClinicListApi = () => {
  return apiClient.get<any>(`/api/clinics/list`);
};

// ----- Merge a duplicate clinic into a canonical one -----
export const mergeClinicApi = (id: string, targetId: string) => {
  return apiClient.post<any>(`/api/clinics/${id}/merge`, { targetId });
};
