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

// Fetch Districts by State ID
export const getDistricts = async (stateId: string) => {
  return apiClient.get<any>(`/api/location/districts?stateId=${stateId}`);
};

// Fetch Cities by District ID (preferred) or State ID fallback
export const getCities = async (stateOrDistrictId: string, useDistrict = false) => {
  if (useDistrict) {
    return apiClient.get<any>(`/api/location/cities?districtId=${stateOrDistrictId}`);
  }
  return apiClient.get<any>(`/api/location/cities?stateId=${stateOrDistrictId}`);
};
