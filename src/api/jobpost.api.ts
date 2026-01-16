// src/api/job.api.ts
import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchJobPostsParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

export interface JobPost {
  id: string;
  jobTitle: string;
  expRequired: string;
  location: string;
  specialization: string;
  employmentType: string;
  noOfApplications: number;
  status: string;
}

export interface JobPostsResponse {
  page: number;
  limit: number;
  total: number;
  data: JobPost[];
}

// Create Job Post
export const createJobPostApi = (data: any) => {
  return apiClient.post<any>(`/api/job/create`, data);
};

//  Fetch Job Posts List
export const fetchJobPostsApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchJobPostsParams): Promise<JobPostsResponse> => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/job/get?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<JobPostsResponse>(url);
};

// Fetch Job Post By ID
export const fetchJobPostByIdApi = (id: string) => {
  return apiClient.get<JobPost>(`/api/job/jobs/${id}`);
};

// Update Job Post By ID
export const updateJobPostApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/job/update/${id}`, data);
};

// Delete Job Post By ID
export const deleteJobPostApi = (id: string) => {
  return apiClient.delete<any>(`/api/job/delete/${id}`);
};