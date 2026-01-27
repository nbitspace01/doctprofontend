import { apiClient } from "./api";


// Fetch State API
export const fetchStateApi = async () => {
  return apiClient.get<any>("/locations");
}