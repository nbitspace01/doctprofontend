import { buildQueryParams } from "../utils/buildQueryParams";
import { apiClient } from "./api";

interface SubAdminRegisterPayload {
  name?: string;
  first_name?: string;
  last_name?: string;
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

// Update Sub Admin
export const SubAdminUpdate = async (
  id: string,
  data: SubAdminRegisterPayload
) => {
  return apiClient.put<any>(`/api/user/update-sub-admin/${id}`, data);
};

// Delete Sub Admin
export const SubAdminDelete = async (id: string) => {
  return apiClient.delete<any>(`/api/user/delete-sub-admin/${id}`);
};


// ------Hospital Admin APIs------
// Create Hospital Admin
export const HospitalAdminRegister = async (data: SubAdminRegisterPayload) => {
  // return apiClient.post<any>("/api/user/create-hospital-admin", data);
  return apiClient.post<any>("/api/user/create-hospital-admin", data);
};

// Fetch Hospital Admin List
export const fetchHospitalAdmin = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  // const url = `/api/dashboard/hospital-admin/list?page=${page}&limit=${limit}${
    const url = `/api/user/hospital-admins?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// Update Hospital Admin
export const HospitalAdminUpdate = async (
  id: string,
  data: SubAdminRegisterPayload
) => {
  // return apiClient.put<any>(`/api/user/update-hospital-admin/${id}`, data);
  return apiClient.put<any>(`/api/user/hospital-admin/${id}`, data);
};

// Delete Hospital Admin
export const HospitalAdminDelete = async (id: string) => {
  // return apiClient.delete<any>(`/api/user/delete-hospital-admin/${id}`);
  return apiClient.delete<any>(`/api/user/hospital-admin/${id}`);
};