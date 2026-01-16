import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// -----Fetch Students API -----
export const fetchStudentsApi = ({
  page,
    limit,
    searchValue = "",
    filterValues = {},
}: FetchParams) => {
    const queryParams = buildQueryParams(searchValue, filterValues);    
    const url = `/api/student/student/list?page=${page}&limit=${limit}${
        queryParams ? `&${queryParams}` : ""
    }`; 
    return apiClient.get<any>(url);
};

// ----- Fetch Student By ID API -----
export const fetchStudentByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/student/${id}`);
};

// ----- Update Student API -----
export const updateStudentApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/student/${id}`, data);
};  

// ----- Delete Student API -----
export const deleteStudentApi = (id: string) => {
  return apiClient.delete<any>(`/api/student/${id}`);
};