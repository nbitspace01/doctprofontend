import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchCollegesParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

export const fetchCollegesApi = ({
  page,
  limit,
  searchValue = "",
  filterValues = {},
}: FetchCollegesParams) => {
  const queryParams = buildQueryParams(searchValue, filterValues);

  const url = `/api/college?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;

  return apiClient.get<any>(url);
};

export const deleteCollegeApi = (id: string) => {
  return apiClient.delete<any>(`/api/college/${id}`);
};
