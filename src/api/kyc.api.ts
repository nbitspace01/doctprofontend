import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

interface KycSubmission {
  id: string;
  kycId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_on: string;
  kyc_status: string;
}


// Create KYC
export const createKYCApi = (data: any) => {
  return apiClient.post<any>(`/api/student/create`, data);
};

// Fetch KYC
export const fetchKYCApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: any) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/kyc/kyc-submissions?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// Fetch By ID KYC
export const fetchKYCByIdApi = (id: string,data: any) => {
  return apiClient.put<any>(`/api/kyc/kyc-submissions/${id}`, data);
};

// Update KYC
export const updateKYCApi = (data: any) => {
  return apiClient.put<any>(`/api/student/update`, data);
};
