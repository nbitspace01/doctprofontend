import { useQuery } from "@tanstack/react-query";
import { Avatar, Button } from "antd";
import axios from "axios";
import React, { useState } from "react";
import HealthCareView from "./HealthCareView";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import Loader from "../../Common/Loader";
import FormattedDate from "../../Common/FormattedDate";

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
  status: string;
  userStatus: boolean;
  userType: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const {
    data: healthcareData,
    isFetching,
    error,
  } = useQuery<HealthcareProfessionalsResponse>({
    queryKey: ["healthcareProfessionals", currentPage, pageSize],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/healthCare/healthcare-professionals?page=${currentPage}&limit=${pageSize}`
      );
      return response.data;
    },
  });

  const professionals = healthcareData?.data || [];
  const total = healthcareData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            type={currentPage === i ? "primary" : "default"}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Show first page
      buttons.push(
        <Button
          key={1}
          type={currentPage === 1 ? "primary" : "default"}
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1">...</span>);
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(
          <Button
            key={i}
            type={currentPage === i ? "primary" : "default"}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        buttons.push(<span key="ellipsis2">...</span>);
      }

      // Show last page
      if (totalPages > 1) {
        buttons.push(
          <Button
            key={totalPages}
            type={currentPage === totalPages ? "primary" : "default"}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        );
      }
    }

    return buttons;
  };

  if (isFetching) {
    return <Loader size="large" />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Healthcare professionals</h1>

      <SearchFilterDownloadButton />

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
                <td className="px-6 py-4 text-sm text-gray-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Avatar className="bg-button-primary w-8 h-8 rounded-full mr-2 text-white">
                      {professional.name?.charAt(0) || "N/A"}
                    </Avatar>
                    <span className="text-sm">
                      {professional.name || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.role || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.email || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.phone || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {professional.qualification || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-blue-600">
                  <FormattedDate dateString={professional.dob} format="long" />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      professional.status ||
                        (professional.userStatus ? "active" : "inactive")
                    )}`}
                  >
                    {professional.status ||
                      (professional.userStatus ? "Active" : "Inactive")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <CommonDropdown
                    onView={() => {
                      setSelectedProfessionalId(professional.id);
                      setIsDrawerOpen(true);
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    showEdit={false}
                    showDelete={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center">
            <span className="mr-2">Items per page</span>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-4 text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {renderPaginationButtons()}
            <Button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
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
