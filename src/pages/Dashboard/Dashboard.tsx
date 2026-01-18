import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Alert } from "antd";
import React from "react";
import {
  totalCollege,
  totalHospital,
} from "../../pages/Common/SVG/svg.functions";
import { fetchDashboardCounts } from "../../api/dashboard.api";

export type UserRole = "admin" | "sub_admin" | "hospital_admin" | "guest";

interface DashboardProps {
  role: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardCounts", role],
    queryFn: fetchDashboardCounts,
    retry: false,
  });

  // ---------------- LOADING STATE ----------------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  // ---------------- ERROR STATE ----------------
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {role === "admin"
            ? "Super Admin Dashboard"
            : role === "sub_admin"
            ? "Sub Admin Dashboard"
            : role === "hospital_admin"
            ? "Hospital Admin Dashboard"
            : "Loading..."}
        </h1>
      </div>

      {/* ---------------- STATS CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">{totalHospital()}</div>
            <div>
              <p className="text-gray-600 text-sm">Hospital Count</p>
              <p className="text-2xl font-bold">
                {data?.users?.hospital_admins ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">{totalCollege()}</div>
            <div>
              <p className="text-gray-600 text-sm">Sub Admin Count</p>
              <p className="text-2xl font-bold">{data?.sub_admins ?? 0}</p>
            </div>
          </div>
        </Card>

        {/* <Card className="shadow-sm bg-white p-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full text-white">
                {totalHospital()}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Doctors Count</p>
                <p className="text-2xl font-bold">
                  {data?.doctors ?? 0}
                </p>
              </div>
            </div>
          </Card> */}
      </div>
    </div>
  );
};

export default Dashboard;
