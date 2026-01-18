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
export const fetchKYCDetails = (id: string, data: any) => {
  return apiClient.put<any>(`/api/kyc/kyc-submissions/${id}`, data);
};

// Update KYC Status
export const updateKYCStatusApi = (id: String, data: any) => {
  return apiClient.put<any>(`/api/kyc/kyc/${id}/status`, data);
};

// KYC Approve Update API
export const ApproveKYCStatusApi = (id: String) => {
  return apiClient.post<any>(`/api/kyc/kyc-submissions/${id}/approve`);
};

// KYC Approve Update API
export const rejectKYCStatusApi = (id: String, data: any) => {
  return apiClient.post<any>(`/api/kyc/kyc-submissions/${id}/reject`, data);
};
