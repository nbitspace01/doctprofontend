import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Alert } from "antd";
import React, { useEffect, useState } from "react";
import {
  kycPending,
  subAdminIcon,
  totalCollege,
  totalHealthCare,
  totalHospital,
  totalJobPost,
  totalStudents,
} from "../../pages/Common/SVG/svg.functions";
import { Briefcase } from "lucide-react";
import {
  fetchDashboardCounts,
  fetchHospitalAdminDashboardCounts,
  fetchSubAdminDashboardCounts,
} from "../../api/dashboard.api";
import { roleProps } from "../../App";

// ---------------- Reusable Card ----------------
export const DashboardStatCard: React.FC<{
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}> = ({
  title,
  value,
  icon,
  gradientFrom = "blue-500",
  gradientTo = "blue-400",
}) => (
  <Card className="shadow-lg rounded-xl p-5 hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-tr from-${gradientFrom} to-${gradientTo} text-white text-xl font-semibold shadow-md`}
      >
        {icon || value}
      </div>
      <div>
        <p className="text-gray-500 uppercase text-xs tracking-wide">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </Card>
);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DashboardStatCard
            title="Hospital Admin Count"
            value={dashboardCounts?.users?.hospital_admins ?? 0}
            icon={totalHospital()}
            gradientFrom="blue-500"
            gradientTo="blue-400"
          />
          <DashboardStatCard
            title="Sub Admin Count"
            value={dashboardCounts?.sub_admins ?? 0}
            icon={subAdminIcon()}
            gradientFrom="purple-500"
            gradientTo="pink-400"
          />
          <DashboardStatCard
            title="Job Posts Count"
            value={dashboardCounts?.jobs?.total ?? 0}
            icon={totalJobPost()}
            gradientFrom="purple-500"
            gradientTo="pink-400"
          />
          <DashboardStatCard
            title="Student Count"
            value={dashboardCounts?.users?.students ?? 0}
            icon={totalStudents()}
            gradientFrom="purple-500"
            gradientTo="pink-400"
          />
          <DashboardStatCard
            title="Healthcare Professional Count"
            value={dashboardCounts?.users?.healthcare_professionals ?? 0}
            icon={totalHealthCare()}
            gradientFrom="purple-500"
            gradientTo="pink-400"
          />
          <DashboardStatCard
            title="KYC Pending"
            value={dashboardCounts?.kyc?.pending ?? 0}
            icon={kycPending()}
            gradientFrom="purple-500"
            gradientTo="pink-400"
          />
        </div>
      )}

      {/* ---------------- SUB ADMIN STATS CARDS ---------------- */}
      {currentRole === "subadmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DashboardStatCard
            title="Hospital Admin Count"
            value={dashboardCounts?.totalHospitalAdmins ?? 0}
            icon={totalHospital()}
            gradientFrom="blue-500"
            gradientTo="blue-400"
          />
          <DashboardStatCard
            title="KYC Pending"
            value={dashboardCounts?.pendingKyc ?? 0}
            icon={kycPending()}
            gradientFrom="orange-500"
            gradientTo="yellow-400"
          />
        </div>
      )}

      {/* ---------------- HOSPITAL ADMIN STATS CARDS ---------------- */}
      {currentRole === "hospitaladmin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DashboardStatCard
            title="Job Post Count"
            value={dashboardCounts?.totalJobPosts ?? 0}
            icon={totalJobPost()}
            gradientFrom="green-500"
            gradientTo="teal-400"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
