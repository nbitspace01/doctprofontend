import { apiClient } from "./api";

// ----- Super Admin Dashboard APIs -----
// Fetch Counts for Dashboard
export const fetchDashboardCounts = async () => {
  const res = await apiClient.get<any>("/api/stats/admin/stats");
  console.log("Dashboard counts: ", res);
  return res ?? {};
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

// ----- Sub Admin Dashboard APIs -----
export const fetchSubAdminDashboardCounts = async () => {
  return apiClient.get<any>("/api/stats/subadmin/hospital-admins/summary");
};

export const fetchSubAdminKycStats = async () => {
  return apiClient.get<any>(
    "/api/dashboard/getKycStatusCounts"
  );
}

export const fetchHealthCareStats = async () => {
  return apiClient.get<any>(
    "/api/professinal"
  );
}

// ----- Hospital Admin Dashboard APIs -----
export const fetchHospitalAdminDashboardCounts = async () => {
  return apiClient.get<any>("/api/stats/hospital/jobs/summary");
};

export const fetchHospitalAdminKycStats = async () => {
  return apiClient.get<any>(
    "/api/hospitaldashboard/kyc-status-counts"
  );
}
