import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, Card, Progress, Select } from "antd";
import axios from "axios";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  totalCollege,
  totalHealthCare,
  totalHospital,
  totalStudents,
} from "../../pages/Common/SVG/svg.functions";
import { getToken } from "../Common/authUtils";
import Loader from "../Common/Loader";
import CommonDropdown from "../Common/CommonActionsDropdown";

const ProgressLabel: React.FC<{ total: number }> = ({ total }) => (
  <div className="text-center text-sm">
    <p className="text-gray-600">Total User</p>
    <p className="text-3xl font-bold">{total}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const fetchDashboardCounts = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/counts`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  };

  const fetchKycStats = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/admin-counts/location`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  };

  const { 
    data, 
    isLoading, 
    isError, 
    error: dashboardCountsError 
  } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: fetchDashboardCounts,
    retry: false,
    // Make this query non-blocking - show UI even if it fails
    // We'll show 0 values as fallback
  });

  const fetchSubAdmin = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/sub-admin/list`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    console.log(res.data, "res.data");
    return res.data;
  };

  const {
    data: subAdmin,
    isLoading: subAdminLoading,
    isError: subAdminError,
    error: subAdminErrorObj,
  } = useQuery({
    queryKey: ["subAdmin"],
    queryFn: fetchSubAdmin,
    refetchOnMount: true,
    staleTime: 0,
  });

  const {
    data: kycStats,
    isLoading: kycStatsLoading,
    isError: kycStatsError,
    error: kycStatsErrorObj,
  } = useQuery({
    queryKey: ["kycStats"],
    queryFn: fetchKycStats,
    retry: false,
    // Make this query non-blocking since it's not currently used in the UI
    // If it fails, we'll just log it but won't block the dashboard
  });

  // Only show loading for subAdmin (critical for the table)
  // dashboardCounts and kycStats are non-blocking - show UI even if they fail
  if (subAdminLoading)
    return <Loader size="large" />;
  
  // Only block on subAdmin error since it's critical for the table
  if (subAdminError) {
    const errorMessage = 
      (subAdminErrorObj as any)?.response?.data?.message ||
      (subAdminErrorObj as any)?.message ||
      (subAdminErrorObj as any)?.response?.statusText ||
      "An error occurred";
    console.error("Sub-admin list error:", subAdminErrorObj);
    return (
      <div className="p-4">
        <div className="text-red-600 font-semibold mb-2">
          Error loading sub-admin list
        </div>
        <div className="text-gray-700">{errorMessage}</div>
      </div>
    );
  }
  
  // Log errors but don't block the UI - show fallback values instead
  if (isError) {
    console.warn("Dashboard counts API error (non-blocking):", dashboardCountsError);
  }
  
  if (kycStatsError) {
    console.warn("KYC Stats API error (non-blocking):", kycStatsErrorObj);
  }

  // Filter sub-admin data based on search and filters
  const filteredSubAdmin = subAdmin?.data?.filter((item: any) => {
    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const fullName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.organization_type?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Apply text filters
    if (filterValues.name) {
      const fullName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
      if (!fullName.includes(filterValues.name.toLowerCase())) return false;
    }
    if (filterValues.email) {
      if (!item.email?.toLowerCase().includes(filterValues.email.toLowerCase())) return false;
    }
    if (filterValues.phone) {
      if (!item.phone?.toLowerCase().includes(filterValues.phone.toLowerCase())) return false;
    }
    if (filterValues.location) {
      if (!item.location?.toLowerCase().includes(filterValues.location.toLowerCase())) return false;
    }

    // Apply checkbox filters (role)
    const selectedRoles = Object.keys(filterValues).filter(
      (key) => key.startsWith("role_") && filterValues[key]
    );
    if (selectedRoles.length > 0) {
      const roles = selectedRoles.map((key) => key.replace("role_", "").toLowerCase());
      if (!roles.includes(item.role?.toLowerCase())) return false;
    }

    // Apply checkbox filters (organization_type)
    const selectedOrgTypes = Object.keys(filterValues).filter(
      (key) => key.startsWith("organization_type_") && filterValues[key]
    );
    if (selectedOrgTypes.length > 0) {
      const orgTypes = selectedOrgTypes.map((key) => key.replace("organization_type_", "").toLowerCase());
      if (!orgTypes.includes(item.organization_type?.toLowerCase())) return false;
    }

    // Apply checkbox filters (status)
    const selectedStatuses = Object.keys(filterValues).filter(
      (key) => key.startsWith("status_") && filterValues[key]
    );
    if (selectedStatuses.length > 0) {
      const statuses = selectedStatuses.map((key) => key.replace("status_", "").toLowerCase());
      if (!statuses.includes(item.status?.toLowerCase())) return false;
    }

    return true;
  }) || [];


  const data1 = [
    {
      date: "1 Mar",
      "New Registration": 15,
      "Job post": 8,
      "Ads post": 5,
      Appointment: 6,
    },
    {
      date: "2 Mar",
      "New Registration": 5,
      "Job post": 10,
      "Ads post": 2,
      Appointment: 1,
    },
    {
      date: "3 Mar",
      "New Registration": 5,
      "Job post": 3,
      "Ads post": 8,
      Appointment: 4,
    },
    {
      date: "4 Mar",
      "New Registration": 8,
      "Job post": 5,
      "Ads post": 20,
      Appointment: 7,
    },
    {
      date: "5 Mar",
      "New Registration": 15,
      "Job post": 8,
      "Ads post": 5,
      Appointment: 5,
    },
    {
      date: "6 Mar",
      "New Registration": 5,
      "Job post": 10,
      "Ads post": 2,
      Appointment: 1,
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Super admin Dashboard</h1>
        {/* <span className="text-blue-500 cursor-pointer">See All →</span> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalHospital() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Hospital Admin Count</p>
              <p className="text-2xl font-bold">
                {(() => {
                  if (!data) return 0;
                  const key = Object.keys(data).find(k =>
                    k.toLowerCase().includes('hospital') && 
                    k.toLowerCase().includes('admin')
                  );
                  return key ? (data as any)[key] : 0;
                })()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalCollege() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Sub Admin Count</p>
              <p className="text-2xl font-bold">
                {(() => {
                  if (!data) return 0;
                  const key = Object.keys(data).find(k =>
                    k.toLowerCase().includes('sub') && 
                    k.toLowerCase().includes('admin')
                  );
                  return key ? (data as any)[key] : 0;
                })()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reports</h2>
              <Select defaultValue="Day" className="w-24">
                <Select.Option value="Day">Day</Select.Option>
                <Select.Option value="Week">Week</Select.Option>
                <Select.Option value="Month">Month</Select.Option>
              </Select>
            </div>
            <BarChart
              width={500}
              height={300}
              data={data1}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="New Registration" fill="#8884d8" />
              <Bar dataKey="Job post" fill="#ff9800" />
              <Bar dataKey="Ads post" fill="#82ca9d" />
              <Bar dataKey="Appointment" fill="#ffc658" />
            </BarChart>
          </Card>
        </div> */}

        {/* Employees Section */}
        {/* <div>
          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Employees</h2>
            <div className="flex justify-center">
              <Progress
                type="circle"
                percent={kycStats.kycApproved}
                success={{
                  percent: kycStats.kycPending,
                  strokeColor: "#4CAF50",
                }}
                format={() => <ProgressLabel total={kycStats.totalUsers} />}
                size={180}
                strokeColor={{ "0%": "#ff9f43", "100%": "#ff9f43" }}
                trailColor="#f5f5f5"
                strokeWidth={12}
              />
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span>KYC Pending ({kycStats.kycPending}%)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>KYC Approved ({kycStats.kycApproved}%)</span>
              </div>
            </div>
          </Card>
        </div> */}
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sub-Admin List</h1>
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate({ to: "/app/subadmin" })}
        >
          See All →
        </span>
      </div>
      {/* Sub Admin Section */}
      <div className="mt-6">
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-4">S No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Organization Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubAdmin.length > 0 ? (
                  filteredSubAdmin
                    .slice(0, 5)
                    .map((admin: any, index: number) => (
                      <tr key={admin.id || index} className="border-t">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {admin.imageUrl || admin.image_url || admin.profile_image ? (
                              <img
                                src={admin.imageUrl || admin.image_url || admin.profile_image}
                                alt={`${admin.first_name || ""} ${admin.last_name || ""}`}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Avatar
                                className="bg-button-primary text-white"
                                size={32}
                              >
                                {admin.first_name
                                  ? admin.first_name.charAt(0).toUpperCase()
                                  : "U"}
                              </Avatar>
                            )}
                            <span>{`${admin.first_name || ""} ${admin.last_name || ""
                              }`.trim() || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{admin.email ?? "N/A"}</td>
                        <td className="py-3 px-4">{admin.phone ?? "N/A"}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                            {admin.role ?? "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4">{admin.location ?? "N/A"}</td>
                        <td className="py-3 px-4">{admin.organization_type ?? "N/A"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${admin.status === "ACTIVE"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                              }`}
                          >
                            {admin.status ?? "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <CommonDropdown
                            onView={() => { }}
                            onEdit={() => { }}
                            onDelete={() => { }}
                          />
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-4 text-center text-gray-500">
                      No sub-admin data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
