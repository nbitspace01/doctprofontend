import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";
import type { OrganizationTypeSlug } from "../pages/MasterList/Organizations/organizationTypes";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// Master-list pharmacies, laboratories and pharma manufacturers all live behind
// the same endpoints, separated by the `type` slug.

// ----- Create Organization API -----
export const createOrganizationApi = (
  type: OrganizationTypeSlug,
  data: any,
) => {
  return apiClient.post<any>(`/api/organizations/${type}`, data);
};

// ----- Fetch Organizations API -----
export const fetchOrganizationsApi = (
  type: OrganizationTypeSlug,
  { page, limit, searchValue = "", filterValues = {} }: FetchParams,
) => {
  const queryParams = buildQueryParams(searchValue, filterValues);
  const url = `/api/organizations/${type}?page=${page}&limit=${limit}${
    queryParams ? `&${queryParams}` : ""
  }`;
  return apiClient.get<any>(url);
};

// ----- Update Organization By ID API -----
export const updateOrganizationApi = (
  type: OrganizationTypeSlug,
  id: string,
  data: any,
) => {
  return apiClient.put<any>(`/api/organizations/${type}/${id}`, data);
};

// ----- Delete Organization API -----
export const deleteOrganizationApi = (
  type: OrganizationTypeSlug,
  id: string,
) => {
  return apiClient.delete<any>(`/api/organizations/${type}/${id}`);
};

// ----- Merge a duplicate organization into a canonical one -----
export const mergeOrganizationApi = (
  type: OrganizationTypeSlug,
  id: string,
  targetId: string,
) => {
  return apiClient.post<any>(`/api/organizations/${type}/${id}/merge`, { targetId });
};

// The GET-by-id and /list endpoints exist on the backend but have no web
// caller: the drawer reuses the row already loaded by the list, and the
// dropdown feed is consumed by the mobile app.
