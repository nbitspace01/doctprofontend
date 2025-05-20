import {
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Dropdown, Input } from "antd";
import axios from "axios";
import React, { useState } from "react";
import HealthCareView from "./HealthCareView";

interface HealthcareProfessional {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  isFresher: boolean;
  currentlyWorking: boolean;
  role: string;
  qualification: string;
  experience: string;
}

interface HealthcareProfessionalsResponse {
  total: number;
  page: number;
  limit: number;
  data: HealthcareProfessional[];
}

const HealthCareList: React.FC = () => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const {
    data: healthcareData,
    isLoading,
    error,
  } = useQuery<HealthcareProfessionalsResponse>({
    queryKey: ["healthcareProfessionals"],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/healthCare/healthcare-professionals`
      );
      return response.data;
    },
  });

  const professionals = healthcareData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-600";
      case "inactive":
        return "bg-red-100 text-red-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Healthcare professionals</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search"
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <Button
            icon={<DownloadOutlined />}
            className="flex items-center"
            type="text"
          >
            Download Report
          </Button>
          <Button icon={<FilterOutlined />} className="flex items-center">
            Filter by
          </Button>
        </div>
      </div>

      <div className=" shadowoverflow-x-auto shadow-sm rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                S No
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Healthcare Professional Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Email Address
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Qualification
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                DOB
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {professionals.map((professional, index) => (
              <tr key={professional.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Avatar className="bg-button-primary w-8 h-8 rounded-full mr-2 text-white">
                      {professional.name?.charAt(0)}
                    </Avatar>
                    <span className="text-sm">{professional.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.role}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.qualification}
                </td>
                <td className="px-6 py-4 text-sm text-blue-600">
                  {professional.dob}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      professional.currentlyWorking ? "active" : "inactive"
                    )}`}
                  >
                    {professional.currentlyWorking ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: "View",
                          onClick: () => {
                            setSelectedProfessionalId(professional.id);
                            setIsDrawerOpen(true);
                          },
                        },
                        { key: "2", label: "Edit" },
                        { key: "3", label: "Delete" },
                      ],
                    }}
                    trigger={["click"]}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center">
            <span className="mr-2">Item per page</span>
            <select className="border rounded px-2 py-1">
              <option>1</option>
              <option>5</option>
              <option>10</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button disabled>Previous</Button>
            <Button type="primary">1</Button>
            <Button>2</Button>
            <span>...</span>
            <Button>3</Button>
            <Button>Next</Button>
          </div>
        </div>
      </div>

      <HealthCareView
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        professionalId={selectedProfessionalId}
      />
    </div>
  );
};

export default HealthCareList;
