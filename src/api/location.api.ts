import { apiClient } from "./api";


// Fetch Countries
export const getCountries = async () => {
  return apiClient.get<any>("/api/location/countries");
}

// Fetch States by Country ID (countryId optional)
export const getStates = async (countryId?: string) => {
  const query = countryId ? `?countryId=${countryId}` : "";
  return apiClient.get<any>(`/api/location/states${query}`);
};

// Fetch Districts by State ID (stateId optional)
export const getDistricts = async (stateId?: string) => {
  const query = stateId ? `?stateId=${stateId}` : "";
  return apiClient.get<any>(`/api/location/districts${query}`);
};
