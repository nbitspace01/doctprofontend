import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// Create Ads Post
export const createAdsPostAPI = (data: any) => {
  return apiClient.post<any>("/api/ads", data);
};

//  Get All Ads Post
export const fetchAdsPostAPI = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/ads?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

//  Get Ads Post By ID
export const getAdsPostByIdAPI = (id: string) => {
  return apiClient.get<any>(`/api/ads/${id}`);
};

//  Get Own Ads Post
export const getOwnAdsPostAPI = (userId: string | null) => (params: FetchParams) => {
  const { page, limit, searchValue = "", filterValues = {} } = params;

  const queryParams = buildQueryParams(searchValue, filterValues);

  const url = `/api/ads/own/${userId}?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;

  return apiClient.get<any>(url);
};

// Update Ads Post
export const updateAdsPostAPI = (id: string, data: any) => {
  return apiClient.put<any>(`/api/ads/${id}`, data);
};

// Status Change Ads Post
export const statusAdsPostAPI = (id: string, status: any) => {
  return apiClient.put<any>(`/api/ads/${id}/status`, status);
};

// Approve Ads Post
export const approveAdsPostAPI = (id: string, status: any) => {
  return apiClient.put<any>(`/api/ads/${id}/status`, status);
};

// Reject Ads Post
export const rejectAdsPostAPI = (id: string, status: any) => {
  return apiClient.put<any>(`/api/ads/${id}/status`, status);
};



// Delete Ads Post
export const deleteAdsPostAPI = (id: string) => {
  return apiClient.delete<any>(`/api/ads/${id}`);
};
