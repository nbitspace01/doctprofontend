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

// Update Status
// export const SubAdminStatusUpdate = async (
//   id: string,
//   data: any
// ) => {
//   return apiClient.put<any>(`/api/user/update-sub-admin/${id}`, data);
// };

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
    const url = `/api/hospital-admin/list?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// Fetch Hospital Admin By ID
export const fetchHospitalAdminById = (id: string) => {
  // return apiClient.get<any>(`/api/user/hospital-admin/${id}`);
  return apiClient.get<any>(`/api/user/hospital-admin/${id}`);
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