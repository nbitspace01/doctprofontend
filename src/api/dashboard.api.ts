import { apiClient } from "./api";

/* Unknown / evolving backend → keep flexible */
export const fetchDashboardCounts = async () => {
  const res = await apiClient.get<any>(
    "/api/stats/admin/stats"
  );

  // normalize once here
  return res?.data ?? {};
};

export const fetchKycStats = async () => {
  return apiClient.get<any>(
    "/api/dashboard/admin-counts/location"
  );
};

export const fetchSubAdmin = async () => {
  return apiClient.get<any>(
    "/api/dashboard/sub-admin/list"
  );
};
