import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// Create Degree API
export const createDegreeApi = (data: any) => {
  return apiClient.post<any>(`/api/degree`, data);
};

// Fetch Degrees API
export const fetchDegreesApi = ({
  page,
    limit,
    searchValue = "",
    filterValues = {},
}: FetchParams) => {
    const queryParams = buildQueryParams(searchValue, filterValues);
    const url = `/api/degree?page=${page}&limit=${limit}${
        queryParams ? `&${queryParams}` : ""
    }`; 
    return apiClient.get<any>(url);
}

// Fetch Degree By ID API
export const fetchDegreeByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/degree/${id}`);
};

// Update Degree API
export const updateDegreeApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/degree/${id}`, data);
};

// Delete Degree API
export const deleteDegreeApi = (id: string) => {
  return apiClient.delete<any>(`/api/degree/${id}`);
};