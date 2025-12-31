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
import { TOKEN, ApiRequest } from "../Common/constant.function";
import Loader from "../Common/Loader";
import FormattedDate from "../Common/FormattedDate";
import DownloadFilterButton from "../Common/DownloadFilterButton";

const ProgressLabel: React.FC<{ total: number }> = ({ total }) => (
  <div className="text-center text-sm">
    <p className="text-gray-600">Total User</p>
    <p className="text-3xl font-bold">{total}</p>
  </div>
);

const SubAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [searchValue, setSearchValue] = useState("");

  const fetchDashboardCounts = async () => {
    const res = await axios.get(
      `${API_URL}/api/dashboard/sub-admin/dashboard-status`,
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: fetchDashboardCounts,
  });

  const fetchSubAdminHealthCare = async () => {
    const res = await ApiRequest.get(
      `${API_URL}/api/professinal`
    );
    const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    return { data: data };
  };

  const {
    data: subAdminHealthCare,
    isLoading: subAdminHealthCareLoading,
    isError: subAdminHealthCareError,
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
  });

  const fetchLocationStatus = async () => {
    const res = await ApiRequest.get(
      `${API_URL}/api/hospitaldashboard/dashboard-status/location`
    );
    return res.data;
  };

  const {
    data: locationStatusData,
  } = useQuery({
    queryKey: ["subAdminLocationStatus"],
    queryFn: fetchLocationStatus,
  });

  if (isLoading || kycStatsLoading || subAdminHealthCareLoading)
    return <Loader size="large" />;
  if (isError || kycStatsError || subAdminHealthCareError)
    return <div>Error: {kycStatsErrorObj?.message ?? "An error occurred"}</div>;

  // Filter healthcare data based on search
  const filteredHealthCare = subAdminHealthCare?.data?.filter((item: any) => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    const fullName = item.firstName && item.lastName 
      ? `${item.firstName} ${item.lastName}` 
      : item.firstName || item.lastName || item.name || "";
    return (
      fullName?.toLowerCase().includes(searchLower) ||
      item.qualification?.toLowerCase().includes(searchLower) ||
      item.degree?.toLowerCase().includes(searchLower) ||
      item.specialization?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const filterOptions = [
    { label: "Full name", key: "name" },
    { label: "Degree", key: "degree" },
    { label: "Specialisation", key: "specialization" },
    { label: "Gender", key: "gender", options: ["Male", "Female"] },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    console.log(`Downloading as ${format}`);
    // Implement download logic here
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filters changed:", filters);
    // Implement filter logic here
  };

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
        <h1 className="text-2xl font-bold">Subadmin Dashboard</h1>
        <span className="text-blue-500 cursor-pointer">See All →</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalHospital() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Hospital</p>
              <p className="text-2xl font-bold">
                {data?.totalHospitals ?? data?.totalHospital ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalHealthCare() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Healthcare Professionals</p>
              <p className="text-2xl font-bold">
                {data?.totalDoctors ?? data?.totalHealthcareProfessionals ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalStudents() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Medical Students</p>
              <p className="text-2xl font-bold">
                {data?.totalStudents ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">
              {totalHealthCare() as React.ReactNode}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Count KYC Pending</p>
              <p className="text-2xl font-bold">
                {data?.pendingKycCount ?? data?.countKycPending ?? 0}
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
              <Bar dataKey="Hospital" fill="#8884d8" />
              <Bar dataKey="healthcare" fill="#ff9800" />
              <Bar dataKey="Medical Student" fill="#82ca9d" />
              <Bar dataKey="CountKYC" fill="#ffc658" />
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

      {/* Healthcare Professionals Section */}
      <div className="mt-6">
        <Card className="shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Healthcare Professionals</h1>
            <span
              className="text-blue-500 cursor-pointer hover:text-blue-700"
              onClick={() => navigate({ to: "/app/healthcare" })}
            >
              See All →
            </span>
          </div>
          <DownloadFilterButton
            onSearch={(value) => setSearchValue(value)}
            searchValue={searchValue}
            onDownload={handleDownload}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-3 px-4">S No</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Degree</th>
                  <th className="py-3 px-4">Specialisation</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">DOB</th>
                  <th className="py-3 px-4">Phone number</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Hospital Name</th>
                  <th className="py-3 px-4">Start Year</th>
                  <th className="py-3 px-4">End Year</th>
                  <th className="py-3 px-4">Current working</th>
                </tr>
              </thead>
              <tbody>
                {filteredHealthCare.length > 0 ? (
                  filteredHealthCare
                    .slice(0, 5)
                    .map((admin: any, index: number) => {
                      const fullName = admin.firstName && admin.lastName 
                        ? `${admin.firstName} ${admin.lastName}` 
                        : admin.firstName || admin.lastName || admin.name || "-";
                      const hospitalName = admin.hospital?.name || admin.hospitalName || admin.hospital_name || 
                        (admin.experience && typeof admin.experience === 'object' ? admin.experience.organization : "") || "-";
                      
                      return (
                        <tr key={admin.id || index} className="border-t">
                          <td className="py-3 px-4 text-sm">{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {admin.imageUrl || admin.profile_image ? (
                                <img
                                  src={admin.imageUrl || admin.profile_image}
                                  alt={fullName}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <Avatar
                                  className="bg-button-primary text-white"
                                  size={32}
                                >
                                  {fullName.charAt(0) !== "-" ? fullName.charAt(0).toUpperCase() : "N"}
                                </Avatar>
                              )}
                              <span className="text-sm">{fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.qualification ?? admin.degree ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.specialization ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.gender ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.role ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.dob ? (
                              <FormattedDate dateString={admin.dob} format="long" />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.phone || admin.phoneNumber || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.email || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {hospitalName}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.startYear ? admin.startYear.toString() : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.endYear ? admin.endYear.toString() : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {admin.status ? (
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                admin.status.toLowerCase() === "active" 
                                  ? "bg-green-100 text-green-600" 
                                  : "bg-red-100 text-red-600"
                              }`}>
                                {admin.status}
                              </span>
                            ) : admin.currentlyWorking !== undefined ? (
                              admin.currentlyWorking ? "Yes" : "No"
                            ) : "-"}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={13} className="py-4 text-center text-gray-500">
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
