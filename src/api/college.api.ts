import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";
import { useQuery } from "@tanstack/react-query";

export interface FetchCollegesParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// Create College
export const createCollegeApi = (data: any) => {
  return apiClient.post<any>(`/api/college`, data);
};

// Fetch Colleges List
export const fetchCollegesApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchCollegesParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);

  const url = `/api/college?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;

  return apiClient.get<any>(url);
};

// Fetch College By ID
export const fetchCollegeByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/college/${id}`);
};

// Update College
export const updateCollegeApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/college/${id}`, data);
};

// Delete College
export const deleteCollegeApi = (id: string) => {
  return apiClient.delete<any>(`/api/college/${id}`);
};
