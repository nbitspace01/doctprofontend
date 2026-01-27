import { buildQueryParams } from "../utils/buildQueryParams";
import { apiClient } from "./api";

interface SubAdminRegisterPayload {
  // name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  organization_type: string;
  status?: "ACTIVE" | "INACTIVE";
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

export interface Clinic {
  id: string;
  name: string;
  branchLocation: string;
  address: string;
  status: "Active" | "Inactive" | "Pending";
  logoUrl?: string;
}

export interface ClinicsResponse {
  page: number;
  limit: number;
  total: number;
  data: Clinic[];
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
  console.log("searchValue:", searchValue);
console.log("filterValues:", filterValues);

  return apiClient.get<any>(url);
}; 

// Fetch Sub Admin By ID
export const fetchSubAdminById = (id: string) => {
  return apiClient.get<any>(`/api/user/sub-admin/${id}`);
};

// Update Sub Admin
export const SubAdminUpdate = async (
  id: string,
  data: any
) => {
  return apiClient.put<any>(`/api/user/update-sub-admin/${id}`, data);
};

// Delete Sub Admin
export const SubAdminDelete = async (id: string) => {
  return apiClient.delete<any>(`/api/user/delete-sub-admin/${id}`);
};
