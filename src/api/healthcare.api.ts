import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchHealthcareParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

export interface HealthcareProfessionalsResponse {
  page: number;
  limit: number;
  total: number;
  data: any[];
}

// Fetch Healthcare Professionals List
export const fetchHealthcareProfessionalsApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchHealthcareParams): Promise<HealthcareProfessionalsResponse> => {
  const queryParams = buildQueryParams(searchValue, filterValues);

  const url = `/api/professional?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  //   const url = `/api/healthCare/healthcare-professionals?page=${page}&limit=${limit}${
  //     queryParams ? `&${queryParams}` : ""
  //   }`;
  return apiClient.get<HealthcareProfessionalsResponse>(url);
};

// Fetch Healthcare Professional By ID
export const fetchHealthcareProfessionalByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/professinal/${id}`);
};

// Update
export const updateHealthcareProfessionalApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/professional/update/${id}`, data);
};

// Delete
export const deleteHealthcareProfessionalApi = (id: string) => {
  return apiClient.delete<any>(`/api/professinal/delete/${id}`);
};
