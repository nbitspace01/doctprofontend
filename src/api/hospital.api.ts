import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";

export interface FetchParams {
  page: number;
  limit: number;
  searchValue?: string;
  filterValues?: Record<string, any>;
}

// -----Create Hospital API -----
export const createHospitalApi = (data: any) => {
  return apiClient.post<any>(`/api/hospital`, data);
}

// -----Fetch Hospitals API -----
export const fetchHospitalsApi = ({
  page,
  limit,
    searchValue = "",
    filterValues = {},
}: FetchParams) => {
    const queryParams = buildQueryParams(searchValue, filterValues);
    const url = `/api/hospital?page=${page}&limit=${limit}${
        queryParams ? `&${queryParams}` : ""
    }`; 
    return apiClient.get<any>(url);
};

// ----- Fetch Hospital By ID API -----
export const updateHospitalApi = (id: string, data: any) => {
  return apiClient.put<any>(`/api/hospital/${id}`, data);
}

// -----Update Hospital API -----
export const fetchHospitalByIdApi = (id: string) => {
  return apiClient.get<any>(`/api/hospital/${id}`);
};

// ----- Delete Hospital API -----
export const deleteHospitalApi = (id: string) => {
  return apiClient.delete<any>(`/api/hospital/${id}`);
};

//----- Fetch Hospital List API(ID and Name Only) -----
export const fetchHospitalListApi = () =>{
  return apiClient.get<any>(`/api/hospital/hospitalNameList`);
}