import { buildQueryParams } from "../utils/buildQueryParams";
import { apiClient } from "./api";

interface SubAdminRegisterPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  organization_type: string;
  state: string;
  district: string;
  password: string;
  confirmPassword: string;
  profile_image?: string;
}

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// ----- Super Admin Auth APIs -----




// ----- Sub Admin Auth APIs -----
// Create Sub Admin
export const SubAdminRegister = async (data: SubAdminRegisterPayload) => {

  return apiClient.post<any>("/api/user/create-sub-admin", data);
};

// Update Sub Admin
export const SubAdminUpdate = async (
  id: string,
  data: SubAdminRegisterPayload
) => {
  return apiClient.put<any>(`/api/user/update-sub-admin/${id}`, data);
};

// Fetch Sub Admin List
export const fetchSubAdmin = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/dashboard/sub-admin/list?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;

  return apiClient.get<any>(url);
}; 

// Delete Sub Admin
export const SubAdminDelete = async (id: string) => {
  return apiClient.delete<any>(`/api/user/delete-sub-admin/${id}`);
};