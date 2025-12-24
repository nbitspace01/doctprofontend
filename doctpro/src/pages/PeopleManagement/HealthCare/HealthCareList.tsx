import { useQuery } from "@tanstack/react-query";
import { Avatar, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useState } from "react";
import HealthCareView from "./HealthCareView";
import AddHealthcareProfessional from "./AddHealthcareProfessional";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import FormattedDate from "../../Common/FormattedDate";
import Loader from "../../Common/Loader";

interface HealthcareProfessional {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  gender: string;
  dob: string;
  degree: string;
  specialization: string;
  startYear?: number;
  endYear?: number;
  isFresher?: boolean;
  currentlyWorking?: boolean;
  role: string;
  qualification: string;
  experience?: string | {
    organization?: string;
    location?: string;
    from?: string;
    to?: string;
  };
  status: string;
  userStatus?: boolean;
  userType?: string;
  location?: string;
  hospitalName?: string;
  hospital_name?: string;
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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const filterOptions = [
    { label: "Full name", key: "name" },
    { label: "Degree", key: "degree" },
    { label: "Specialization", key: "specialization" },
    { label: "Gender", key: "gender", options: ["Male", "Female"] },
    { label: "Role", key: "role" },
    { label: "Phone number", key: "phone" },
    { label: "Email Address", key: "email" },
    { label: "Hospital Name", key: "hospitalName" },
    { label: "Start Year", key: "startYear" },
    { label: "End Year", key: "endYear" },
    { label: "Working Status", key: "status", options: ["Active", "Inactive"] },
  ];

  const filterParams = Object.entries(selectedFilters)
    .filter(
      ([_, value]) =>
        value !== "" && value !== false && value !== null && value !== undefined
    )
    .map(([key, value]) => {
      if (typeof value === "boolean" && value) {
        if (key.includes("_")) {
          const [filterKey, filterValue] = key.split("_", 2);
          return `&${filterKey}=${encodeURIComponent(filterValue)}`;
        }
        return `&${key}=true`;
      }
      return `&${key}=${encodeURIComponent(String(value))}`;
    })
    .join("");

  const searchParam = searchValue
    ? `&search=${encodeURIComponent(searchValue)}`
    : "";
  const paginationParam = `?page=${currentPage}&limit=${pageSize}`;
  const fullParam = `${paginationParam}${searchParam}${filterParams}`;

  const {
    data: healthcareData,
    isFetching,
    error,
    refetch,
  } = useQuery<HealthcareProfessionalsResponse>({
    queryKey: ["healthcareProfessionals", currentPage, pageSize, selectedFilters, searchValue],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/healthCare/healthcare-professionals${fullParam}`
      );
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const professionals = healthcareData?.data || [];
  const total = healthcareData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  console.log("Current state:", {
    currentPage,
    pageSize,
    total,
    totalPages,
    professionalsCount: professionals.length,
    isFetching,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePageChange = (page: number) => {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    console.log(`Changing page size to ${size}`);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    // Don't render pagination if there are no pages
    if (totalPages <= 0) {
      return null;
    }

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            type={currentPage === i ? "primary" : "default"}
            onClick={() => handlePageChange(i)}
            disabled={isFetching}
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
          disabled={isFetching}
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
            disabled={isFetching}
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
            disabled={isFetching}
          >
            {totalPages}
          </Button>
        );
      }
    }

    return buttons;
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleDownload = (format: "excel" | "csv") => {
    const headers = [
      "S.no",
      "Full name",
      "Degree",
      "Specialization",
      "Gender",
      "Role",
      "DOB",
      "Phone number",
      "Email Address",
      "Hospital Name",
      "Start Year",
      "End Year",
      "Current working",
    ];

    const rows = professionals.map((professional, index) => {
      const hospitalName =
        professional.hospitalName ||
        professional.hospital_name ||
        (professional.experience &&
        typeof professional.experience === "object"
          ? professional.experience.organization
          : "") ||
        "-";

      return [
        (currentPage - 1) * pageSize + index + 1,
        professional.name || "-",
        professional.qualification || professional.degree || "-",
        professional.specialization || "-",
        professional.gender || "-",
        professional.role || "-",
        professional.dob
          ? new Date(professional.dob).toLocaleDateString()
          : "-",
        professional.phone || professional.phoneNumber || "-",
        professional.email || "-",
        hospitalName,
        professional.startYear ? professional.startYear.toString() : "-",
        professional.endYear ? professional.endYear.toString() : "-",
        professional.status ||
          (professional.currentlyWorking !== undefined
            ? professional.currentlyWorking
              ? "Yes"
              : "No"
            : "-"),
      ];
    });

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "healthcare-professionals-report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "excel") {
      const escapeXml = (str: string) => {
        return String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      };

      const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>
   <Row>
${headers.map((header) => `    <Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("\n")}
   </Row>
${rows
  .map(
    (row) =>
      `   <Row>
${row.map((cell) => `    <Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`).join("\n")}
   </Row>`
  )
  .join("\n")}
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([excelXml], {
        type: "application/vnd.ms-excel",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "healthcare-professionals-report.xls";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-center">
          Error loading data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
          <Button onClick={() => refetch()} className="ml-4" type="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Healthcare professionals</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          Add healthcare Professional
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onDownload={handleDownload}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          searchValue={searchValue}
        />

        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  S.no
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Full name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Degree
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  DOB
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Phone number
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Email Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Hospital Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Start Year
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  End Year
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Current working
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-4 text-center text-gray-500">
                    {isFetching ? (
                      <Loader size="large" />
                    ) : (
                      "No healthcare professionals found"
                    )}
                  </td>
                </tr>
              ) : (
                professionals.map((professional, index) => {
                  const hospitalName = professional.hospitalName || professional.hospital_name || 
                    (professional.experience && typeof professional.experience === 'object' ? professional.experience.organization : "") || "";
                  
                  return (
                    <tr key={professional.id}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-button-primary text-white">
                            <Avatar className="bg-button-primary text-white">
                              {professional.name?.charAt(0) || "-"}
                            </Avatar>
                          </div>
                          <span className="text-sm">{professional.name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.qualification || professional.degree || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.specialization || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.gender ? (
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              professional.gender.toLowerCase() === "male" ? "bg-green-500" :
                              professional.gender.toLowerCase() === "female" ? "bg-orange-500" : "bg-gray-400"
                            }`}></span>
                            {professional.gender}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.role || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {professional.dob ? <FormattedDate dateString={professional.dob} format="long" /> : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.phone || professional.phoneNumber || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {hospitalName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.startYear ? professional.startYear.toString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {professional.endYear ? professional.endYear.toString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {professional.status ? (
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            professional.status.toLowerCase() === "active" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {professional.status}
                          </span>
                        ) : professional.currentlyWorking !== undefined ? (
                          professional.currentlyWorking ? "Yes" : "No"
                        ) : "-"}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center">
              <span className="mr-2">Items per page</span>
              <select
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={isFetching}
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
                disabled={currentPage === 1 || isFetching}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {renderPaginationButtons()}
              <Button
                disabled={currentPage === totalPages || isFetching}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <HealthCareView
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        professionalId={selectedProfessionalId}
      />

      <AddHealthcareProfessional
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default HealthCareList;
