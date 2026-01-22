import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Alert } from "antd";
import React, { useEffect, useState } from "react";
import {
  totalCollege,
  totalHealthCare,
  totalHospital,
} from "../../pages/Common/SVG/svg.functions";
import {
  fetchDashboardCounts,
  fetchHospitalAdminDashboardCounts,
  fetchSubAdminDashboardCounts,
} from "../../api/dashboard.api";
import { roleProps } from "../../App";

const Dashboard: React.FC<roleProps> = ({ role: propRole }) => {
  /* -------------------- Local State -------------------- */
  const [currentRole, setCurrentRole] = useState<roleProps["role"] | null>(
    null,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* -------------------- Fetch localStorage on mount -------------------- */
  useEffect(() => {
    const storedRole =
      (localStorage.getItem("roleName") as roleProps["role"]) || propRole;
    const storedUserId = localStorage.getItem("userId") || null;

    setCurrentRole(storedRole);
    setCurrentUserId(storedUserId);
  }, [propRole]);

  /* -------------------- Query -------------------- */
  const {
    data: dashboardCounts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboardCounts", currentRole, currentUserId],
    queryFn: () => {
      if (currentRole === "admin") {
        return fetchDashboardCounts();
      } else if (currentRole === "subadmin") {
        return fetchSubAdminDashboardCounts();
      } else {
        return fetchHospitalAdminDashboardCounts();
      }
    },
    enabled: !!currentUserId && !!currentRole,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  /* -------------------- Loading & Error States -------------------- */
  if (!currentRole || !currentUserId || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="Failed to load dashboard"
          description={(error as Error)?.message || "Something went wrong"}
          showIcon
        />
      </div>
    );
  }

  /* -------------------- Dashboard Header -------------------- */
  const dashboardTitle =
    currentRole === "admin"
      ? "Super Admin Dashboard"
      : currentRole === "subadmin"
        ? "Sub Admin Dashboard"
        : currentRole === "hospitaladmin"
          ? "Hospital Admin Dashboard"
          : "Loading...";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{dashboardTitle}</h1>
      </div>

      {/* ---------------- ADMIN STATS CARDS ---------------- */}
      {currentRole === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalHospital()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Hospital Admin Count</p>
                <p className="text-2xl font-bold">
                  {dashboardCounts?.users?.hospital_admins ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalCollege()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Sub Admin Count</p>
                <p className="text-2xl font-bold">
                  {dashboardCounts?.sub_admins ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- SUB ADMIN STATS CARDS ---------------- */}
      {currentRole === "subadmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalHospital()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Hospital Admin Count</p>
                <p className="text-2xl font-bold">
                  {dashboardCounts?.data?.totalHospitalAdmins ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalHealthCare()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">KYC Pending</p>
                <p className="text-2xl font-bold">
                  {dashboardCounts?.data?.pendingKyc ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- HOSPITAL ADMIN STATS CARDS ---------------- */}
      {currentRole === "hospitaladmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalHospital()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Job Post Count</p>
                <p className="text-2xl font-bold">
                  {dashboardCounts?.data?.totalJobPosts ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
