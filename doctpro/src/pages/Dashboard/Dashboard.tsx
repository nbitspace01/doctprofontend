import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Card, Progress, Select } from "antd";
import axios from "axios";
import React from "react";
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

const ProgressLabel: React.FC<{ total: number }> = ({ total }) => (
  <div className="text-center text-sm">
    <p className="text-gray-600">Total User</p>
    <p className="text-3xl font-bold">{total}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const fetchDashboardCounts = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/counts`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  };

  const fetchKycStats = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/getKycStatusCounts`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: fetchDashboardCounts,
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
  });

  if (isLoading || kycStatsLoading || subAdminLoading)
    return <Loader size="large" />;
  if (isError || kycStatsError || subAdminError)
    return <div>Error: {kycStatsErrorObj?.message ?? "An error occurred"}</div>;

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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-blue-500 cursor-pointer">See All →</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(data)
          .filter(([key]) =>
            [
              "totalColleges",
              "totalHospitals",
              "totalStudents",
              "totalProfessionals",
            ].includes(key)
          )
          .map(([key, value]) => (
            <Card key={key} className="shadow-sm bg-white p-2">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full text-white`}>
                  {(key === "totalHospitals" &&
                    (totalHospital() as React.ReactNode)) ||
                    (key === "totalColleges" &&
                      (totalCollege() as React.ReactNode)) ||
                    (key === "totalStudents" &&
                      (totalStudents() as React.ReactNode)) ||
                    (key === "totalProfessionals" &&
                      (totalHealthCare() as React.ReactNode))}{" "}
                  ||
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    {key.replace(/([A-Z])/g, " $1").replace("total ", "Total ")}
                  </p>
                  <p className="text-2xl font-bold">{value as number}</p>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
              <Bar dataKey="Job post" fill="#82ca9d" />
              <Bar dataKey="Ads post" fill="#ffc658" />
              <Bar dataKey="Appointment" fill="#ff7300" />
            </BarChart>
          </Card>
        </div>

        {/* Employees Section */}
        <div>
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
        </div>
      </div>

      {/* Sub Admin Section */}
      <div className="mt-6">
        <Card className="shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Sub Admin List</h1>
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate({ to: "/app/subadmin" })}
            >
              See All →
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-4">S No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {subAdmin?.data?.length > 0 ? (
                  subAdmin.data.slice(0, 5).map((admin: any, index: number) => (
                    <tr key={admin.id} className="border-t">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {admin.imageUrl ? (
                            <img
                              src={admin.imageUrl}
                              alt={`${admin.first_name} ${admin.last_name}`}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-button-primary flex items-center justify-center text-white">
                              {admin.first_name
                                ? admin.first_name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}
                          <span>{`${admin.first_name || ""} ${
                            admin.last_name || ""
                          }`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{admin.email}</td>
                      <td className="py-3 px-4">{admin.phone ?? "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                          {admin.role ?? "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            admin.status === "ACTIVE"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
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
