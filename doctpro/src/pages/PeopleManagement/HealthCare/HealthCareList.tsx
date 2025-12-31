import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import HealthCareView from "./HealthCareView";
import AddHealthcareProfessional from "./AddHealthcareProfessional";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import FormattedDate from "../../Common/FormattedDate";
import Loader from "../../Common/Loader";
import CommonPagination from "../../Common/CommonPagination";
import { ApiRequest } from "../../Common/constant.function";

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
  data: HealthcareProfessional[];
  total: number;
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
  const [editData, setEditData] = useState<any>(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const filterOptions = [
    { label: "Full name", key: "firstName" },
    { label: "Degree", key: "degree" },
    { label: "Specialization", key: "specialization" },
    { label: "Gender", key: "gender", options: ["Male", "Female"] },
    { label: "Role", key: "role" },
    { label: "Phone number", key: "phone" },
    { label: "Email Address", key: "email" },
    { label: "Hospital Name", key: "hospitalName" },
    { label: "Start Year", key: "startYear" },
    { label: "End Year", key: "endYear" },
    { label: "Working Status", key: "currentlyWorking", options: ["true", "false"] },
  ];

  const fetchHealthcareProfessionals = async (): Promise<HealthcareProfessionalsResponse> => {
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const searchParam = searchValue ? `&search=${searchValue}` : "";

    const filterParams = [];
    if (selectedFilters.firstName) {
      filterParams.push(`firstName=${encodeURIComponent(selectedFilters.firstName)}`);
    }
    if (selectedFilters.degree) {
      filterParams.push(`degree=${encodeURIComponent(selectedFilters.degree)}`);
    }
    if (selectedFilters.specialization) {
      filterParams.push(`specialization=${encodeURIComponent(selectedFilters.specialization)}`);
    }
    if (selectedFilters.role) {
      filterParams.push(`role=${encodeURIComponent(selectedFilters.role)}`);
    }
    if (selectedFilters.phone) {
      filterParams.push(`phone=${encodeURIComponent(selectedFilters.phone)}`);
    }
    if (selectedFilters.email) {
      filterParams.push(`email=${encodeURIComponent(selectedFilters.email)}`);
    }
    if (selectedFilters.hospitalName) {
      filterParams.push(`hospitalName=${encodeURIComponent(selectedFilters.hospitalName)}`);
    }
    if (selectedFilters.startYear) {
      filterParams.push(`startYear=${encodeURIComponent(selectedFilters.startYear)}`);
    }
    if (selectedFilters.endYear) {
      filterParams.push(`endYear=${encodeURIComponent(selectedFilters.endYear)}`);
    }

    if (selectedFilters.gender) {
      const selectedGenders = Object.keys(selectedFilters).filter(
        (key) => key.startsWith("gender_") && selectedFilters[key]
      );
      if (selectedGenders.length > 0) {
        filterParams.push(
          `gender=${selectedGenders
            .map((key) => key.replace("gender_", ""))
            .join(",")}`
        );
      }
    }
    if (selectedFilters.currentlyWorking) {
      const selectedStatuses = Object.keys(selectedFilters).filter(
        (key) => key.startsWith("currentlyWorking_") && selectedFilters[key]
      );
      if (selectedStatuses.length > 0) {
        filterParams.push(
          `currentlyWorking=${selectedStatuses
            .map((key) => key.replace("currentlyWorking_", ""))
            .join(",")}`
        );
      }
    }

    const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
    const res = await ApiRequest.get(
      `${API_URL}/api/professinal?page=${validPage}&limit=${validLimit}${searchParam}${filterParam}`
    );

    console.log("API Response:", res);
    console.log("res.data:", res.data);
    
    const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    const totalCount = Array.isArray(res.data) 
      ? res.data.length 
      : (res.data?.total ?? res.data?.count ?? data.length);
    
    console.log("Processed data:", data);
    console.log("Total count:", totalCount);
    
    return {
      data: data,
      total: totalCount
    };
  };

  const {
    data: healthcareData,
    isFetching,
    error,
    refetch,
  } = useQuery<HealthcareProfessionalsResponse, Error>({
    queryKey: ["healthcareProfessionals", currentPage, pageSize, selectedFilters, searchValue],
    queryFn: fetchHealthcareProfessionals,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const professionals = healthcareData?.data ?? [];
  const total = healthcareData?.total ?? 0;
  console.log("healthcareProfessionals", professionals);
  console.log("healthcareData", healthcareData);
  console.log("total", total);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (professional: any) => {
    setEditData(professional);
    setIsAddModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await ApiRequest.delete(`${API_URL}/api/professinal/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthcareProfessionals"] });
      message.success("Healthcare professional deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete healthcare professional");
    },
  });

  const handleDelete = (professional: any) => {
    deleteMutation.mutate(professional.id);
  };

  const handlePaginationChange = (page: number, size?: number) => {
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    console.log("Search value:", value);
    setSearchValue(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
    setSelectedFilters(filters);
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!professionals || professionals.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
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

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    professionals.forEach((professional: any, index: number) => {
      const fullName = professional.firstName && professional.lastName 
        ? `${professional.firstName} ${professional.lastName}` 
        : professional.firstName || professional.lastName || professional.name || "-";
      const hospitalName = professional.hospital?.name || professional.hospitalName || professional.hospital_name || "-";

      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${fullName}"`,
        `"${professional.qualification || professional.degree || "N/A"}"`,
        `"${professional.specialization || "N/A"}"`,
        `"${professional.gender || "N/A"}"`,
        `"${professional.role || "N/A"}"`,
        `"${professional.dob ? new Date(professional.dob).toLocaleDateString() : "N/A"}"`,
        `"${professional.phone || professional.phoneNumber || "N/A"}"`,
        `"${professional.email || "N/A"}"`,
        `"${hospitalName || "N/A"}"`,
        `"${professional.startYear ? professional.startYear.toString() : "N/A"}"`,
        `"${professional.endYear ? professional.endYear.toString() : "N/A"}"`,
        `"${professional.status || (professional.currentlyWorking !== undefined ? (professional.currentlyWorking ? "Yes" : "No") : "N/A")}"`,
      ];
      rows.push(values.join(format === "csv" ? "," : "\t"));
    });

    const content = rows.join("\n");
    const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
    const fileExtension = format === "csv" ? "csv" : "xls";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthcare-professionals-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <h1 className="text-2xl font-semibold">Healthcare professionals</h1>
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
            <thead style={{ backgroundColor: '#FAFAFA' }}>
              <tr>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  S.no
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Full name
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Degree
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Specialization
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Gender
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Role
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  DOB
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Phone number
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Email Address
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Hospital Name
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Start Year
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  End Year
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Current working
                </th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: '#000000E0' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-4 text-center text-sm">
                    {isFetching ? (
                      <Loader size="large" />
                    ) : (
                      "No healthcare professionals found"
                    )}
                  </td>
                </tr>
              ) : (
                professionals.map((professional: any, index: number) => {
                  const fullName = professional.firstName && professional.lastName 
                    ? `${professional.firstName} ${professional.lastName}` 
                    : professional.firstName || professional.lastName || professional.name || "-";
                  const hospitalName = professional.hospital?.name || professional.hospitalName || professional.hospital_name || 
                    (professional.experience && typeof professional.experience === 'object' ? professional.experience.organization : "") || "";
                  
                  return (
                    <tr key={professional.id}>
                      <td className="px-6 py-4 text-sm">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-button-primary text-white">
                            <Avatar className="bg-button-primary text-white">
                              {fullName.charAt(0) !== "-" ? fullName.charAt(0).toUpperCase() : "-"}
                            </Avatar>
                          </div>
                          <span className="text-sm">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.qualification || professional.degree || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.specialization || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.gender || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.role || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.dob ? <FormattedDate dateString={professional.dob} format="long" /> : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.phone || professional.phoneNumber || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {hospitalName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {professional.startYear ? professional.startYear.toString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
                          <span className="text-sm">{professional.currentlyWorking ? "Yes" : "No"}</span>
                        ) : <span className="text-sm">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <CommonDropdown
                          onView={() => {
                            setSelectedProfessionalId(professional.id);
                            setIsDrawerOpen(true);
                          }}
                          onEdit={() => handleEdit(professional)}
                          onDelete={() => handleDelete(professional)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <CommonPagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePageSizeChange}
          disabled={isFetching}
        />
      </div>

      <HealthCareView
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        professionalId={selectedProfessionalId}
      />

      <AddHealthcareProfessional
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setEditData(null);
        }}
        onSuccess={() => {
          setIsAddModalOpen(false);
          setEditData(null);
          refetch();
        }}
        initialData={editData}
      />
    </div>
  );
};

export default HealthCareList;
