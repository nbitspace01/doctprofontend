import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, message, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import { showSuccess } from "../../Common/Notification";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonPagination from "../../Common/CommonPagination";
import { ApiHospitalData } from "../Hospital.types";
import AddHospitalModal from "./AddHospitalModal";

const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: ApiHospitalData[];
}

const fetchHospitals = async (
  currentPage: number,
  pageSize: number,
  searchValue: string,
  filterValues: Record<string, any>
): Promise<ApiResponse> => {
  const validPage = currentPage || 1;
  const validLimit = pageSize || 10;
  const searchParam = searchValue ? `&search=${searchValue}` : "";

  // Process filter values to convert checkbox-style filters to proper format
  const processedFilters: Record<string, any> = {};
  Object.entries(filterValues).forEach(([key, value]) => {
    // Skip empty values
    if (!value || value === "" || value === null || value === undefined) {
      return;
    }
    
    if (key.includes("_")) {
      // Handle checkbox-style filters like "status_Active"
      // Don't send status filter to API - handle it on frontend only
      if (key.startsWith("status_")) {
        // Skip status filters - we'll handle them on the frontend
        return;
      }
      
      const [filterKey, filterValue] = key.split("_");
      if (value === true) {
        // For other checkbox filters, collect all selected values
        if (!processedFilters[filterKey]) {
          processedFilters[filterKey] = [];
        }
        if (Array.isArray(processedFilters[filterKey])) {
          processedFilters[filterKey].push(filterValue);
        } else {
          processedFilters[filterKey] = [processedFilters[filterKey], filterValue];
        }
      }
    } else {
      // Handle regular text filters (name, branchLocation)
      // Trim whitespace and only add if not empty after trim
      const trimmedValue = String(value).trim();
      if (trimmedValue) {
        // Use the key as-is, but ensure proper encoding
        processedFilters[key] = trimmedValue;
      }
    }
  });

  // Build filter parameters
  const filterParams: string[] = [];
  Object.entries(processedFilters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // For arrays (multiple status selections), join with comma
      filterParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
    } else {
      filterParams.push(`${key}=${encodeURIComponent(value)}`);
    }
  });

  const filterParam = filterParams.length > 0 ? filterParams.join("&") : "";
  const fullUrl = `${API_URL}/api/hospital?page=${validPage}&limit=${validLimit}${searchParam}${filterParam ? `&${filterParam}` : ""}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch hospitals");
  }
  return response.json();
};

interface HospitalData {
  key: string;
  sNo: number;
  name: string;
  logo: string | null;
  branchLocation: string;
  updatedOn: string;
  address: string;
  status: "Active" | "Inactive" | "Pending";
}

const fetchHospitalById = async (id: string): Promise<ApiHospitalData> => {
  const response = await fetch(`${API_URL}/api/hospital/byId`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error("Failed to fetch hospital details");
  const data = await response.json();
  return data.data || data.hospital || data;
};

const updateHospital = async (data: { id: string; hospitalData: Partial<ApiHospitalData> }) => {
  const response = await fetch(`${API_URL}/api/hospital/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.hospitalData),
  });
  if (!response.ok) throw new Error("Failed to update hospital");
  return response.json();
};


const HospitalList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewHospitalId, setViewHospitalId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const filterOptions = [
    {
      label: "Name",
      key: "name",
      type: "text" as const,
    },
    {
      label: "Branch Location",
      key: "branchLocation",
      type: "text" as const,
    },
    {
      label: "Updated on Portal",
      key: "updatedOn",
      type: "date" as const,
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Inactive", "Pending"],
    },
  ];
  const { data: hospitals, isFetching } = useQuery<ApiResponse, Error>({
    queryKey: ["hospitals", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchHospitals(currentPage, pageSize, searchValue, filterValues),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: selectedHospital } = useQuery({
    queryKey: ["hospital", selectedHospitalId],
    queryFn: () =>
      selectedHospitalId ? fetchHospitalById(selectedHospitalId) : null,
    enabled: !!selectedHospitalId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: viewHospital, isLoading: isViewLoading } = useQuery({
    queryKey: ["hospital", viewHospitalId],
    queryFn: () => (viewHospitalId ? fetchHospitalById(viewHospitalId) : null),
    enabled: !!viewHospitalId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });



  const updateHospitalMutation = useMutation({
    mutationFn: updateHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      if (viewHospitalId) queryClient.invalidateQueries({ queryKey: ["hospital", viewHospitalId] });
      if (selectedHospitalId) queryClient.invalidateQueries({ queryKey: ["hospital", selectedHospitalId] });
    },
    onError: () => message.error("Failed to update hospital"),
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    if (viewHospitalId) queryClient.invalidateQueries({ queryKey: ["hospital", viewHospitalId] });
    if (selectedHospitalId) queryClient.invalidateQueries({ queryKey: ["hospital", selectedHospitalId] });
    setIsModalOpen(false);
    setSelectedHospitalId(null);
  };

  const handleUpdateHospital = async (hospitalData: Partial<ApiHospitalData>) => {
    if (!selectedHospitalId) return;
    const response = await updateHospitalMutation.mutateAsync({ id: selectedHospitalId, hospitalData });
    showSuccess(notification, { message: response.message });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  let filteredHospitals = hospitals?.data || [];
  const { name: nameFilter, branchLocation: branchLocationFilter, updatedOn: updatedOnFilter } = filterValues;
  const statusFilters = Object.entries(filterValues)
    .filter(([key, value]) => key.startsWith("status_") && value === true)
    .map(([key]) => key.replace("status_", ""))
    .filter(Boolean);
  
  const formatDate = (dateValue: string) => {
    if (!dateValue) return null;
    try {
      const dateObj = new Date(dateValue);
      if (isNaN(dateObj.getTime())) return null;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch {
      return null;
    }
  };

  const transformStatus = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    return statusLower === "active" ? "Active" : statusLower === "inactive" ? "Inactive" : "Pending";
  };

  const getDateValue = (hospital: ApiHospitalData) => (hospital as any).updatedAt || hospital.updated_at || "";

  if (nameFilter || branchLocationFilter || updatedOnFilter || statusFilters.length > 0) {
    filteredHospitals = filteredHospitals.filter((hospital: ApiHospitalData) => {
      const matchesName = !nameFilter || hospital.name?.toLowerCase().includes(String(nameFilter).toLowerCase().trim());
      const matchesBranchLocation = !branchLocationFilter || hospital.branchLocation?.toLowerCase().includes(String(branchLocationFilter).toLowerCase().trim());
      const matchesUpdatedOn = !updatedOnFilter || (() => {
        try {
          const hospitalDateValue = getDateValue(hospital);
          if (!hospitalDateValue) return false;
          const hospitalDate = new Date(hospitalDateValue);
          const filterDate = new Date(updatedOnFilter);
          if (isNaN(hospitalDate.getTime()) || isNaN(filterDate.getTime())) return false;
          const hospitalDateOnly = new Date(hospitalDate.getFullYear(), hospitalDate.getMonth(), hospitalDate.getDate());
          const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          return hospitalDateOnly.getTime() === filterDateOnly.getTime();
        } catch {
          return false;
        }
      })();
      const matchesStatus = statusFilters.length === 0 || statusFilters.some(filter => 
        transformStatus(hospital.status || "").toLowerCase() === filter.toLowerCase().trim()
      );
      return matchesName && matchesBranchLocation && matchesUpdatedOn && matchesStatus;
    });
  }

  const hasClientSideFilters = nameFilter || branchLocationFilter || updatedOnFilter || statusFilters.length > 0;
  const displayTotal = hasClientSideFilters ? filteredHospitals.length : (hospitals?.total ?? 0);

  const tableData: HospitalData[] = filteredHospitals.map((hospital, index) => ({
    key: hospital.id,
    sNo: index + 1,
    name: hospital.name,
    logo: hospital.logoUrl,
    branchLocation: hospital.branchLocation,
    address: hospital.address,
    updatedOn: getDateValue(hospital),
    status: transformStatus(hospital.status || "") as HospitalData["status"],
  }));

  const columns: ColumnsType<HospitalData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 70,
    },
    {
      title: "Hospital/Clinic Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const isValidImageUrl = (url: string | null) => {
          if (!url || url === "null") return false;
          try {
            JSON.parse(url);
            return false;
          } catch {
            return url.startsWith("http://") || url.startsWith("https://");
          }
        };
        const hasValidImage = isValidImageUrl(record.logo);
        return (
          <div className="flex items-center gap-3">
            {hasValidImage && (
              <img
                src={record.logo!}
                alt={text}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            )}
            <Avatar className={`bg-button-primary text-white ${hasValidImage ? "hidden" : ""}`}>
              {text.charAt(0)}
            </Avatar>
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: "Branch Location",
      dataIndex: "branchLocation",
      key: "branchLocation",
    },
    {
      title: "Updated on Portal",
      dataIndex: "updatedOn",
      key: "updatedOn",
      width: 180,
      render: (dateValue: string) => {
        const formatted = formatDate(dateValue);
        return <span className={formatted ? "" : "text-gray-500"}>{formatted || "N/A"}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusClass = status === "Active" ? "text-green-600 bg-green-50" : status === "Inactive" ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50";
        return <span className={`text-sm px-3 py-1 rounded-full ${statusClass}`}>{status}</span>;
      },
    },
    {
      title: "Action",
      key: "action",

      render: (_, record) => (
        <CommonDropdown
          onView={() => {
            setViewHospitalId(record.key);
            setIsDrawerOpen(true);
          }}
          onEdit={async () => {
            setSelectedHospitalId(record.key);
            setIsModalOpen(true);
          }}
          onDelete={() => {}}
        />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    const cleanedFilters: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) return;
      if (key.includes("_")) {
        if (value === true) cleanedFilters[key] = value;
      } else {
        const trimmed = String(value).trim();
        if (trimmed) cleanedFilters[key] = trimmed;
      }
    });
    setFilterValues(cleanedFilters);
    setCurrentPage(1);
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!tableData?.length) return;
    const delimiter = format === "csv" ? "," : "\t";
    const headers = ["S No", "Hospital/Clinic Name", "Branch Location", "Status"];
    const rows = [headers.join(delimiter), ...tableData.map(row => 
      [row.sNo, `"${row.name || "N/A"}"`, `"${row.branchLocation || "N/A"}"`, `"${row.status || "N/A"}"`].join(delimiter)
    )];
    const blob = new Blob([rows.join("\n")], { type: format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospitals-report-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Hospital & Clinics Management
        </h1>
        <Button
          type="primary"
          onClick={() => {
            setSelectedHospitalId(null);
            setIsModalOpen(true);
          }}
          className="bg-button-primary hover:!bg-button-primary"
        >
          + Add New Hospital & Clinics
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
        />

        <Table
          columns={columns}
          dataSource={tableData}
          scroll={{ x: "max-content" }}
          pagination={false}
          loading={isFetching}
          className="shadow-sm rounded-lg"
        />
        <CommonPagination
          current={currentPage}
          pageSize={pageSize}
          total={displayTotal}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>

      <Drawer
        title="Hospital & Clinics Management"
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          setViewHospitalId(null);
        }}
        open={isDrawerOpen}
        width={500}
      >
        {isViewLoading ? (
          <Skeleton active />
        ) : viewHospital && typeof viewHospital === "object" ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {(() => {
                const isValidImageUrl = (url: string | null) => {
                  if (!url || url === "null") return false;
                  try {
                    JSON.parse(url);
                    return false;
                  } catch {
                    return url.startsWith("http://") || url.startsWith("https://");
                  }
                };
                const hasValidImage = isValidImageUrl(viewHospital.logoUrl);
                return hasValidImage ? (
                  <img src={viewHospital.logoUrl!} alt={viewHospital.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <Avatar size={50} className="bg-button-primary">{viewHospital.name?.charAt(0) || ""}</Avatar>
                );
              })()}
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{viewHospital.name}</h3>
                {(() => {
                  const transformedStatus = transformStatus(viewHospital.status || "");
                  const statusClass = transformedStatus === "Active" ? "text-green-600 bg-green-50" : transformedStatus === "Inactive" ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50";
                  return <span className={`text-sm px-3 py-1 rounded-full ${statusClass}`}>{transformedStatus}</span>;
                })()}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Branch Location</h4>
              <p>{viewHospital.branchLocation || "N/A"}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Updated on Portal</h4>
              <p>
                {(() => {
                  const dateValue = (viewHospital as any)?.updatedAt || viewHospital?.updated_at || (viewHospital as any)?.createdOn || (viewHospital as any)?.created_at || "";
                  const formatted = formatDate(String(dateValue).trim());
                  return <span className={formatted ? "" : "text-gray-500"}>{formatted || "N/A"}</span>;
                })()}
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>

      <AddHospitalModal
        key={selectedHospitalId || "new"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHospitalId(null);
        }}
        onSuccess={handleSuccess}
        initialData={selectedHospital}
        onUpdate={handleUpdateHospital}
        isEditing={!!selectedHospitalId}
      />
    </div>
  );
};

export default HospitalList;