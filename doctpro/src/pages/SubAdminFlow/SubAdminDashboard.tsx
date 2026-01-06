import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, Card, Progress, Select } from "antd";
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
import { TOKEN } from "../Common/constant.function";
import Loader from "../Common/Loader";
import FormattedDate from "../Common/FormattedDate";

const ProgressLabel: React.FC<{ total: number }> = ({ total }) => (
  <div className="text-center text-sm">
    <p className="text-gray-600">Total User</p>
    <p className="text-3xl font-bold">{total}</p>
  </div>
);

const SubAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const fetchDashboardCounts = async () => {
    const res = await axios.get(
      `${API_URL}/api/dashboard/subadmin-counts/location`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    return res.data;
  };

  const fetchKycStats = async () => {
    const res = await axios.get(`${API_URL}/api/dashboard/getKycStatusCounts`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
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
    // We'll show fallback values
  });

  const fetchSubAdminHealthCare = async () => {
    const res = await axios.get(
      `${API_URL}/api/professinal`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    console.log(res.data, "res.data");
    return res.data;
  };

  const {
    data: subAdminHealthCare,
    isLoading: subAdminHealthCareLoading,
    isError: subAdminHealthCareError,
    error: subAdminHealthCareErrorObj,
  } = useQuery({
    queryKey: ["subAdmin"],
    queryFn: fetchSubAdminHealthCare,
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
    // Make this query non-blocking - show UI even if it fails
    // We'll show fallback values
  });

  // Only show loading for subAdminHealthCare (critical for the table)
  // dashboardCounts and kycStats are non-blocking - show UI even if they fail
  if (subAdminHealthCareLoading)
    return <Loader size="large" />;
  
  // Only block on subAdminHealthCare error since it's critical for the table
  if (subAdminHealthCareError) {
    const errorMessage = 
      (subAdminHealthCareErrorObj as any)?.response?.data?.message ||
      (subAdminHealthCareErrorObj as any)?.message ||
      (subAdminHealthCareErrorObj as any)?.response?.statusText ||
      "An error occurred";
    console.error("Healthcare professionals error:", subAdminHealthCareErrorObj);
    return (
      <div className="p-4">
        <div className="text-red-600 font-semibold mb-2">
          Error loading healthcare professionals
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

  // Helper function to get full name
  const getFullName = (professional: any) => {
    if (professional.firstName && professional.lastName) {
      return `${professional.firstName} ${professional.lastName}`;
    }
    if (professional.firstName) {
      return professional.firstName;
    }
    if (professional.lastName) {
      return professional.lastName;
    }
    if (professional.name) {
      return professional.name;
    }
    return "N/A";
  };

  // Handle both response structures: array directly or wrapped in object
  const professionals = Array.isArray(subAdminHealthCare)
    ? subAdminHealthCare
    : (subAdminHealthCare?.data || []);

  const data1 = [
    {
      date: "1 Mar",
      Hospital: 15,
      healthcare: 8,
      "Medical Student": 5,
      CountKYC: 6,
    },
    {
      date: "2 Mar",
      Hospital: 5,
      healthcare: 10,
      "Medical Student": 2,
      CountKYC: 1,
    },
    {
      date: "3 Mar",
      Hospital: 5,
      healthcare: 3,
      "Medical Student": 8,
      CountKYC: 4,
    },
    {
      date: "4 Mar",
      Hospital: 8,
      healthcare: 5,
      "Medical Student": 20,
      CountKYC: 7,
    },
    {
      date: "5 Mar",
      Hospital: 15,
      healthcare: 8,
      "Medical Student": 5,
      CountKYC: 5,
    },
    {
      date: "6 Mar",
      Hospital: 5,
      healthcare: 10,
      "Medical Student": 2,
      CountKYC: 1,
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sub admin Dashboard</h1>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data && Object.keys(data).length > 0 ? (
          Object.entries(data)
            .filter(([key]) =>
              [
                "totalHospitals",
                "pendingKycCount",
              ].includes(key)
            )
            .map(([key, value]) => (
              <Card key={key} className="shadow-sm bg-white p-2">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full text-white`}>
                    {(key === "totalHospitals" &&
                      (totalHospital() as React.ReactNode)) ||
                      (key === "pendingKycCount" &&
                        (totalHealthCare() as React.ReactNode))}{" "}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      {key === "totalHospitals" 
                        ? "Total Hospitals"
                        : key === "pendingKycCount"
                        ? "KYC Pending"
                        : key.replace(/([A-Z])/g, " $1").replace("total ", "Total ")}
                    </p>
                    <p className="text-2xl font-bold">{value as number}</p>
                  </div>
                </div>
              </Card>
            ))
        ) : (
          [
            { key: "totalHospitals", label: "Total Hospitals", icon: totalHospital },
            { key: "pendingKycCount", label: "KYC Pending", icon: totalHealthCare },
          ].map(({ key, label, icon }) => (
            <Card key={key} className="shadow-sm bg-white p-2">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full text-white">
                  {icon() as React.ReactNode}
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{label}</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>
          ))
        )}
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
              <Bar dataKey="Hospital" fill="#8884d8" />
              <Bar dataKey="healthcare" fill="#82ca9d" />
              <Bar dataKey="Medical Student" fill="#ffc658" />
              <Bar dataKey="CountKYC" fill="#ff7300" />
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
                percent={kycStats?.kycApproved || 0}
                success={{
                  percent: kycStats?.kycPending || 0,
                  strokeColor: "#4CAF50",
                }}
                format={() => <ProgressLabel total={kycStats?.totalUsers || 0} />}
                size={180}
                strokeColor={{ "0%": "#ff9f43", "100%": "#ff9f43" }}
                trailColor="#f5f5f5"
                strokeWidth={12}
              />
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                <span>KYC Pending ({kycStats?.kycPending || 0}%)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>KYC Approved ({kycStats?.kycApproved || 0}%)</span>
              </div>
            </div>
          </Card>
        </div> */}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Healthcare Professionals</h1>
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate({ to: "/app/healthcare" })}
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
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">DOB</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Degree</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Start Year</th>
                  <th className="py-3 px-4">End Year</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {professionals.length > 0 ? (
                  professionals
                    .slice(0, 5)
                    .map((professional: any, index: number) => {
                      const fullName = getFullName(professional);
                      const avatarInitial = fullName !== "N/A" ? fullName.charAt(0).toUpperCase() : professional.email?.charAt(0).toUpperCase() || "N";
                      return (
                        <tr key={professional.id} className="border-t">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {professional.profilePicture ? (
                                <img
                                  src={professional.profilePicture}
                                  alt={fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center p-4 rounded-full bg-button-primary text-white">
                                  <Avatar className="bg-button-primary text-white">
                                    {avatarInitial}
                                  </Avatar>
                                </div>
                              )}
                              <span className="text-sm">{fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{professional.email || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.phone || "N/A"}</td>
                          <td className="py-3 px-4">
                            {professional.dob ? (
                              <FormattedDate dateString={professional.dob} format="long" />
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">{professional.gender || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.city || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.state || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.country || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.degree || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.specialization || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.startYear || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.endYear || "N/A"}</td>
                          <td className="py-3 px-4 text-sm">{professional.role || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                professional.isActive
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {professional.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={15} className="py-4 text-center text-gray-500">
                      No Healthcare Professionals data available
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

export default SubAdminDashboard;
