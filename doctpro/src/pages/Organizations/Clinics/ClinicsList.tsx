import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonPagination from "../../Common/CommonPagination";
import HospitalRegistration from "../../Registration/Hospital/HospitalRegistration";
import ClinicViewDrawer from "./ClinicViewDrawer";

interface Hospital {
  id: string;
  name: string;
  branchLocation: string;
  address: string;
  status: "Active" | "Inactive" | "Pending" | "pending";
  logoUrl?: string;
  updatedAt?: string;
  updated_at?: string; // Keep for backward compatibility
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Hospital[];
}

const ClinicsList = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const { data: apiResponse, isFetching } = useQuery({
    queryKey: ["hospitals", currentPage, pageSize, searchValue, filterValues],
    queryFn: async () => {
      // Process filter values
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      
      // Handle search value
      if (searchValue) {
        params.search = searchValue;
      }
      
      // Process filter values - handle all filter types
      Object.entries(filterValues).forEach(([key, value]) => {
        // Skip empty values
        if (!value || value === "" || value === null || value === undefined) {
          return;
        }
        
        if (key.includes("_")) {
          // Handle checkbox-style filters like "status_Active"
          const [filterKey, filterValue] = key.split("_");
          if (value === true) {
            // For status filters, collect all selected statuses
            if (!params[filterKey]) {
              params[filterKey] = [];
            }
            if (Array.isArray(params[filterKey])) {
              params[filterKey].push(filterValue);
            } else {
              params[filterKey] = [params[filterKey], filterValue];
            }
          }
        } else {
          // Handle regular text filters (name, branchLocation)
          // Trim whitespace and only add if not empty after trim
          const trimmedValue = String(value).trim();
          if (trimmedValue) {
            // Send the filter directly with the key name
            params[key] = trimmedValue;
          }
        }
      });
      
      // Convert status array to comma-separated string if it exists
      if (Array.isArray(params.status)) {
        params.status = params.status.join(",");
      }
      
      // Build URL with all parameters to ensure they're sent correctly
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          urlParams.append(key, String(value));
        }
      });
      
      const fullUrl = `${API_URL}/api/hospital?${urlParams.toString()}`;
      console.log("Full API URL:", fullUrl);
      console.log("API Request Params:", JSON.stringify(params, null, 2));
      console.log("Filter values from state:", filterValues);
      
      const { data } = await axios.get(fullUrl);
      console.log("API Response - Total:", data?.total, "Data count:", data?.data?.length);
      console.log("API hospital data", data);
      return data as ApiResponse;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Apply client-side filtering if API doesn't support name/branchLocation filters
  let hospitals = apiResponse?.data || [];
  const apiTotal = apiResponse?.total || 0;
  
  // Client-side filtering for name and branchLocation (if API doesn't filter them)
  const nameFilter = filterValues.name;
  const branchLocationFilter = filterValues.branchLocation;
  
  if (nameFilter || branchLocationFilter) {
    hospitals = hospitals.filter((hospital: Hospital) => {
      const matchesName = !nameFilter || 
        hospital.name?.toLowerCase().includes(String(nameFilter).toLowerCase().trim());
      const matchesBranchLocation = !branchLocationFilter || 
        hospital.branchLocation?.toLowerCase().includes(String(branchLocationFilter).toLowerCase().trim());
      return matchesName && matchesBranchLocation;
    });
  }
  
  const total = nameFilter || branchLocationFilter ? hospitals.length : apiTotal;
  
  // Debug: Log hospital data to check for updated_at
  console.log("Hospitals data:", hospitals);
  if (hospitals.length > 0) {
    console.log("First hospital updated_at:", hospitals[0]?.updated_at);
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    // Clean up empty values from filters
    const cleanedFilters: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      // Only keep non-empty values
      if (value !== "" && value !== null && value !== undefined) {
        // For checkboxes, only keep if true
        if (key.includes("_")) {
          if (value === true) {
            cleanedFilters[key] = value;
          }
        } else {
          // For text inputs, trim and keep if not empty
          const trimmed = String(value).trim();
          if (trimmed) {
            cleanedFilters[key] = trimmed;
          }
        }
      }
    });
    
    console.log("Filter values received:", filters);
    console.log("Cleaned filter values:", cleanedFilters);
    setFilterValues(cleanedFilters);
    setCurrentPage(1);
  };

  const columns: ColumnsType<Hospital> = [
    // s no will be the index of the row
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Hospital/Clinic Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Hospital) => (
        <div className="flex items-center gap-2">
          {record.logoUrl ? (
            <img
              src={record.logoUrl}
              alt={text}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-button-primary text-white rounded-full flex items-center justify-center">
              {text.charAt(0)}
            </div>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Branch Location",
      dataIndex: "branchLocation",
      key: "branchLocation",
    },
    {
      title: "Updated on Portal",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (dateValue: string | undefined, record: Hospital) => {
        // Try updatedAt first (camelCase from API), then updated_at (snake_case) for backward compatibility
        const date = dateValue || record.updatedAt || record.updated_at;
        if (!date) {
          return <span className="text-gray-500">N/A</span>;
        }
        try {
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            return <span className="text-gray-500">N/A</span>;
          }
          const day = dateObj.getDate();
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const month = monthNames[dateObj.getMonth()];
          const year = dateObj.getFullYear();
          return <span>{`${day} ${month} ${year}`}</span>;
        } catch (error) {
          console.error("Date parsing error:", error, date);
          return <span className="text-gray-500">N/A</span>;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Active"
              ? "success"
              : status === "Inactive"
              ? "error"
              : "warning"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: Hospital) => (
        <CommonDropdown
          onView={() => {
            setSelectedHospitalId(record.id);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          showDelete={false}
          showEdit={false}
        />
      ),
    },
  ];

  // Debug: Log column titles to verify "Updated on Portal" is included
  console.log("Table columns:", columns.map(col => col.title));
  console.log("Column count:", columns.length);
  const hasUpdatedColumn = columns.some(col => col.title === "Updated on Portal");
  console.log("Has 'Updated on Portal' column:", hasUpdatedColumn);
  if (!hasUpdatedColumn) {
    console.error("ERROR: 'Updated on Portal' column is missing from columns array!");
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Hospital & Clinics Management
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
          className="bg-button-primary"
        >
          Add New Hospital & Clinics
        </Button>
      </div>

      {isModalVisible && (
        <HospitalRegistration
          isOpen={isModalVisible}
          onClose={handleCloseModal}
        />
      )}

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={[
            {
              label: "Name",
              key: "name",
            },
            {
              label: "Branch Location",
              key: "branchLocation",
            },
            {
              label: "Status",
              key: "status",
              options: ["Active", "Inactive", "Pending"],
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        <Table
          columns={columns}
          dataSource={hospitals}
          loading={isFetching}
          scroll={{ x: "max-content" }}
          pagination={false}
          className="w-full"
          rowKey="id"
        />
        <CommonPagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>

      {selectedHospitalId && (
        <ClinicViewDrawer
          isOpen={true}
          onClose={() => setSelectedHospitalId(null)}
          hospitalId={selectedHospitalId}
        />
      )}
    </div>
  );
};

export default ClinicsList;
