// src/api/job.api.ts
import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";
import { FetchParams } from "./admin.api";

export interface FetchJobPostsParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

export interface JobPost {
  id: string;
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  status: string;
  noOfApplications?: number;
  valid_from?: string;
  expires_at?: string;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
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

// Fetch Own Job List
export const fetchOwnJobPostsApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchJobPostsParams): Promise<any> => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/job/own?page=${page}&limit=${limit}${
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

// Status Change Job Post By ID
export const statusJobPostApi = (id: string, status: any) => {
  return apiClient.put<any>(`/api/job/status/${id}`, status);
};

// Status Change Job Post By ID
export const applicationStatusJobPostApi = (id: string, status: any) => {
  return apiClient.put<any>(`api/job/jobs/applications/${id}/status`, status);
};

// Delete Job Post By ID
export const deleteJobPostApi = (id: string) => {
  return apiClient.delete<any>(`/api/job/delete/${id}`);
};
