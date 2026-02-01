import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// ------Create Students API-----
export const createStudentApi = (data: any) => {
  return apiClient.post<any>(`/api/student/create`, data);
};

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
  return apiClient.put<any>(`/api/student/update/${id}`, data);
};

// ----- Update Student 
export const updateStudentStatusApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/student/status/${id}`, data);
};

// ----- Delete Student API -----
export const deleteStudentApi = (id: string) => {
  return apiClient.delete<any>(`/api/student/delete/${id}`);
};

// ----- Register Student Education -----
export const registerStudentEducation = (userId: string, data: FormData) => {
  return apiClient.post<any>(`/api/student/register/education/student/${userId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
