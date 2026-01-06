import { Avatar, Button, Image, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddHospitalAdminModal from "./AddHospitalAdminModal";
import { ApiRequest } from "../Common/constant.function";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ViewSubAdmin from "../SubAdmin/ViewSubAdmin";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import Loader from "../Common/Loader";
import CommonPagination from "../Common/CommonPagination";
import StatusBadge from "../Common/StatusBadge";

interface HospitalAdminData {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  role: string;
  location?: string;
  organization_type: string;
  status: string;
  active_user: boolean;
  associated_location?: string;
  image_url?: string;
  profile_image?: string;
  state?: string;
  district?: string;
}

const HospitalAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<HospitalAdminData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedHospitalAdmin, setSelectedHospitalAdmin] = useState<HospitalAdminData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  interface HospitalAdminResponse {
    data: HospitalAdminData[];
    total: number;
  }

  const filterOptions = [
    {
      label: "Name",
      key: "name",
      type: "text" as const,
    },
    {
      label: "Email Address",
      key: "email",
      type: "text" as const,
    },
    {
      label: "Phone Number",
      key: "phone",
      type: "text" as const,
    },
    {
      label: "Role",
      key: "role",
      type: "checkbox" as const,
      options: ["Sub Admin", "Hospital Admin"],
    },
    {
      label: "State",
      key: "state",
      type: "text" as const,
    },
    {
      label: "District",
      key: "district",
      type: "text" as const,
    },
    {
      label: "Organization Type",
      key: "organization_type",
      type: "checkbox" as const,
      options: ["Hospital", "College", "University", "Institute", "Training Center"],
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Inactive", "Pending"],
    },
  ];

  const fetchHospitalAdmin = async (): Promise<HospitalAdminResponse> => {
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const searchParam = searchValue ? `&search=${encodeURIComponent(searchValue.trim())}` : "";

    // Build filter parameters
    const filterParams: string[] = [];
    
    // Handle name filter
    if (filterValues.name && String(filterValues.name).trim()) {
      filterParams.push(`name=${encodeURIComponent(String(filterValues.name).trim())}`);
    }
    
    // Handle email filter
    if (filterValues.email && String(filterValues.email).trim()) {
      filterParams.push(`email=${encodeURIComponent(String(filterValues.email).trim())}`);
    }
    
    // Handle phone filter
    if (filterValues.phone && String(filterValues.phone).trim()) {
      filterParams.push(`phone=${encodeURIComponent(String(filterValues.phone).trim())}`);
    }
    
    // Handle state filter
    if (filterValues.state && String(filterValues.state).trim()) {
      filterParams.push(`state=${encodeURIComponent(String(filterValues.state).trim())}`);
    }
    
    // Handle district filter
    if (filterValues.district && String(filterValues.district).trim()) {
      filterParams.push(`district=${encodeURIComponent(String(filterValues.district).trim())}`);
    }

    // Handle checkbox-style filters (role, organization_type, status)
    const selectedRoles = Object.keys(filterValues).filter(
      (key) => key.startsWith("role_") && filterValues[key] === true
    );
    if (selectedRoles.length > 0) {
      const roleValues = selectedRoles.map((key) => {
        const filterValue = key.replace("role_", "");
        // Map display values to API values
        const roleMapping: Record<string, string> = {
          "Sub Admin": "subadmin",
          "Hospital Admin": "hospitaladmin",
        };
        const apiRoleValue = roleMapping[filterValue] || filterValue.toLowerCase().replace(/\s/g, "-");
        return encodeURIComponent(apiRoleValue);
      });
      filterParams.push(`role=${roleValues.join(",")}`);
    }
    
    const selectedOrgTypes = Object.keys(filterValues).filter(
      (key) => key.startsWith("organization_type_") && filterValues[key] === true
    );
    if (selectedOrgTypes.length > 0) {
      const orgTypeValues = selectedOrgTypes.map((key) => {
        const filterValue = key.replace("organization_type_", "");
        // Normalize organization type values for API (lowercase)
        const normalizedOrgType = filterValue.toLowerCase();
        return encodeURIComponent(normalizedOrgType);
      });
      filterParams.push(`organization_type=${orgTypeValues.join(",")}`);
    }
    
    const selectedStatuses = Object.keys(filterValues).filter(
      (key) => key.startsWith("status_") && filterValues[key] === true
    );
    if (selectedStatuses.length > 0) {
      // Map filter values to database format (Active -> ACTIVE, Inactive -> INACTIVE, Pending -> PENDING)
      const statusMapping: Record<string, string> = {
        "Active": "ACTIVE",
        "Inactive": "INACTIVE",
        "Pending": "PENDING"
      };
      const statusValues = selectedStatuses.map((key) => {
        const filterValue = key.replace("status_", "");
        const mappedValue = statusMapping[filterValue] || filterValue.toUpperCase();
        return encodeURIComponent(mappedValue);
      });
      filterParams.push(`status=${statusValues.join(",")}`);
    }

    const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
    
    const fullUrl = `${API_URL}/api/user/hospital-admins?page=${validPage}&limit=${validLimit}${searchParam}${filterParam}`;
    console.log("Hospital Admin API URL:", fullUrl);
    
    const res = await ApiRequest.get(fullUrl);

    // Handle different response structures
    let responseData: any[] = [];
    let responseTotal = 0;

    // If response is an array directly
    if (Array.isArray(res.data)) {
      responseData = res.data;
      responseTotal = res.data.length;
    }
    // If response has data and total properties
    else if (res.data && res.data.data) {
      responseData = res.data.data ?? [];
      responseTotal = res.data.total ?? res.data.data?.length ?? 0;
    }
    // If response.data is the object with data array
    else if (res.data && Array.isArray(res.data)) {
      responseData = res.data;
      responseTotal = res.data.length;
    }

    // Transform API response to match our interface
    // API returns 'name' as a single field, we need to split it for display
    const transformedData = responseData.map((item: any) => {
      // Split name into first_name and last_name if name exists
      let first_name = item.first_name || "";
      let last_name = item.last_name || "";
      
      if (item.name && !first_name && !last_name) {
        const nameParts = item.name.trim().split(" ");
        first_name = nameParts[0] || "";
        last_name = nameParts.slice(1).join(" ") || "";
      }

      return {
        ...item,
        first_name,
        last_name,
        // Ensure state and district are included from API response
        state: item.state || "",
        district: item.district || "",
      };
    });

    return {
      data: transformedData,
      total: responseTotal,
    };
  };

  const { data: hospitalAdminResponse, isFetching } = useQuery<
    HospitalAdminResponse,
    Error
  >({
    queryKey: ["hospitalAdmin", currentPage, pageSize, searchValue, filterValues],
    queryFn: fetchHospitalAdmin,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Apply client-side filtering for all filters including search
  let filteredHospitalAdmin = hospitalAdminResponse?.data ?? [];
  const nameFilter = filterValues.name;
  const emailFilter = filterValues.email;
  const phoneFilter = filterValues.phone;
  const stateFilter = filterValues.state;
  const districtFilter = filterValues.district;
  
  // Collect checkbox filters (role, organization_type, status)
  const roleFilters: string[] = [];
  const orgTypeFilters: string[] = [];
  const statusFilters: string[] = [];
  
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.includes("_") && value === true) {
      // Handle keys with multiple underscores (e.g., "organization_type_Hospital")
      // Split at the last underscore to get the filter key and value
      const lastUnderscoreIndex = key.lastIndexOf("_");
      const filterKey = key.substring(0, lastUnderscoreIndex);
      const filterValue = key.substring(lastUnderscoreIndex + 1);
      
      if (filterKey === "role") {
        roleFilters.push(filterValue);
      } else if (filterKey === "organization_type") {
        orgTypeFilters.push(filterValue);
      } else if (filterKey === "status") {
        statusFilters.push(filterValue);
      }
    }
  });
  
  // Apply all filters including search
  if (searchValue || nameFilter || emailFilter || phoneFilter || stateFilter || districtFilter || 
      roleFilters.length > 0 || orgTypeFilters.length > 0 || statusFilters.length > 0) {
    filteredHospitalAdmin = filteredHospitalAdmin.filter((admin: HospitalAdminData) => {
      // Search filter - search across multiple fields
      const matchesSearch = !searchValue || (() => {
        const searchLower = String(searchValue).toLowerCase().trim();
        if (!searchLower) return true;
        
        const fullName = `${admin.first_name || ""} ${admin.last_name || ""}`.trim() || admin.name || "";
        const email = admin.email || "";
        const phone = admin.phone || "";
        const state = admin.state || "";
        const district = admin.district || "";
        const role = admin.role || "";
        const orgType = admin.organization_type || "";
        
        return (
          fullName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          phone.toLowerCase().includes(searchLower) ||
          state.toLowerCase().includes(searchLower) ||
          district.toLowerCase().includes(searchLower) ||
          role.toLowerCase().includes(searchLower) ||
          orgType.toLowerCase().includes(searchLower)
        );
      })();
      
      // Name filter
      const matchesName = !nameFilter || (() => {
        const fullName = `${admin.first_name || ""} ${admin.last_name || ""}`.trim() || admin.name || "";
        return fullName.toLowerCase().includes(String(nameFilter).toLowerCase().trim());
      })();
      
      // Email filter
      const matchesEmail = !emailFilter || 
        (admin.email && admin.email.toLowerCase().includes(String(emailFilter).toLowerCase().trim()));
      
      // Phone filter
      const matchesPhone = !phoneFilter || 
        (admin.phone && admin.phone.toLowerCase().includes(String(phoneFilter).toLowerCase().trim()));
      
      // State filter
      const matchesState = !stateFilter || 
        (admin.state && admin.state.toLowerCase().includes(String(stateFilter).toLowerCase().trim()));
      
      // District filter
      const matchesDistrict = !districtFilter || 
        (admin.district && admin.district.toLowerCase().includes(String(districtFilter).toLowerCase().trim()));
      
      // Role filter - match display values with API values
      const matchesRole = roleFilters.length === 0 || (() => {
        const adminRole = String(admin.role || "").trim().toLowerCase();
        if (!adminRole) return false;
        
        // Normalize admin role (remove hyphens, underscores, spaces)
        const normalizedAdminRole = adminRole.replace(/-/g, "").replace(/_/g, "").replace(/\s/g, "");
        
        return roleFilters.some(filterRole => {
          // Map display values to API values for comparison
          const roleMapping: Record<string, string> = {
            "Sub Admin": "subadmin",
            "Hospital Admin": "hospitaladmin",
          };
          
          const mappedRole = roleMapping[filterRole] || filterRole.toLowerCase().replace(/\s/g, "");
          const normalizedMappedRole = mappedRole.replace(/-/g, "").replace(/_/g, "").replace(/\s/g, "");
          
          // Match normalized values
          return normalizedAdminRole === normalizedMappedRole || 
                 normalizedAdminRole.includes(normalizedMappedRole) ||
                 normalizedMappedRole.includes(normalizedAdminRole);
        });
      })();
      
      // Organization Type filter - case-insensitive matching
      const matchesOrgType = orgTypeFilters.length === 0 || (() => {
        const adminOrgType = String(admin.organization_type || "").trim().toLowerCase();
        if (!adminOrgType) return false;
        
        return orgTypeFilters.some(filterOrgType => {
          const filterOrgTypeLower = String(filterOrgType).trim().toLowerCase();
          // Handle "Training Center" -> "training center" mapping
          const normalizedFilter = filterOrgTypeLower === "training center" ? "training center" : filterOrgTypeLower;
          const normalizedAdmin = adminOrgType === "training center" ? "training center" : adminOrgType;
          
          // Exact match
          if (normalizedAdmin === normalizedFilter) return true;
          
          // Also check if admin type contains the filter (for partial matches)
          return normalizedAdmin.includes(normalizedFilter) || normalizedFilter.includes(normalizedAdmin);
        });
      })();
      
      // Status filter - match case-insensitively
      const matchesStatus = statusFilters.length === 0 || (() => {
        const adminStatus = String(admin.status || "").trim();
        if (!adminStatus) return false;
        
        const adminStatusLower = adminStatus.toLowerCase();
        return statusFilters.some(status => {
          const statusLower = String(status).toLowerCase().trim();
          // Map database status to filter status for comparison
          const statusMap: Record<string, string> = {
            "active": "active",
            "inactive": "inactive",
            "pending": "pending"
          };
          const normalizedAdminStatus = statusMap[adminStatusLower] || adminStatusLower;
          return statusLower === normalizedAdminStatus;
        });
      })();
      
      return matchesSearch && matchesName && matchesEmail && matchesPhone && matchesState && matchesDistrict && 
             matchesRole && matchesOrgType && matchesStatus;
    });
  }

  const hospitalAdmin = filteredHospitalAdmin;
  // Use filtered count if client-side filtering is applied, otherwise use API total
  const hasClientSideFilters = searchValue || nameFilter || emailFilter || phoneFilter || stateFilter || districtFilter || 
    roleFilters.length > 0 || orgTypeFilters.length > 0 || statusFilters.length > 0;
  const totalCount = hasClientSideFilters 
    ? filteredHospitalAdmin.length 
    : (hospitalAdminResponse?.total ?? 0);

  const handleDownload = (format: "excel" | "csv") => {
    if (!hospitalAdmin || hospitalAdmin.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "Name",
      "Email Address",
      "Phone Number",
      "Role",
      "State",
      "District",
      "Organization Type",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    hospitalAdmin.forEach((row, index) => {
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${`${row.first_name || ""} ${row.last_name || ""}`.trim() || row.name || "N/A"}"`,
        `"${row.email || "N/A"}"`,
        `"${row.phone || "N/A"}"`,
        `"${row.role || "N/A"}"`,
        `"${row.state || "N/A"}"`,
        `"${row.district || "N/A"}"`,
        `"${row.organization_type || "N/A"}"`,
        `"${row.status || "N/A"}"`,
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
    a.download = `hospital-admin-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = (record: HospitalAdminData) => {
    // Split name into first_name and last_name if name exists but first_name/last_name don't
    let first_name = record.first_name || "";
    let last_name = record.last_name || "";
    
    if (record.name && !first_name && !last_name) {
      const nameParts = record.name.trim().split(" ");
      first_name = nameParts[0] || "";
      last_name = nameParts.slice(1).join(" ") || "";
    }

    const editDataWithDefaults: HospitalAdminData = {
      ...record,
      first_name: first_name,
      last_name: last_name,
      role: record.role || "",
      location: record.location || "",
      profile_image: record.profile_image || record.image_url || "",
      state: record.state || "",
      district: record.district || "",
    };

    setEditData(editDataWithDefaults);
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
      await ApiRequest.delete(`${API_URL}/api/user/hospital-admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalAdmin"] });
      message.success("Hospital admin deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete hospital admin");
    },
  });

  const handleDelete = (record: HospitalAdminData) => {
    deleteMutation.mutate(record.id);
  };

  const handleViewHospitalAdmin = (hospitalAdmin: HospitalAdminData) => {
    setSelectedHospitalAdmin(hospitalAdmin);
    setIsViewDrawerOpen(true);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const columns: ColumnsType<HospitalAdminData> = [
    {
      title: "S No",
      key: "sNo",
      width: 70,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.profile_image || record.image_url ? (
            <Image
              src={record.profile_image || record.image_url}
              width={40}
              height={40}
              alt="Hospital Admin"
              className="rounded-full"
            />
          ) : (
            <Avatar
              size={40}
              className="bg-button-primary rounded-full mr-2 text-white"
            >
              {record.first_name?.charAt(0) || record.email?.charAt(0) || "A"}
            </Avatar>
          )}
          <span>{`${record.first_name || ""} ${record.last_name || ""}`.trim() || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone ?? "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => role ?? "N/A",
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (state) => state ?? "N/A",
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      render: (district) => district ?? "N/A",
    },
    {
      title: "Organization Type",
      dataIndex: "organization_type",
      key: "organization_type",
      render: (orgType) => orgType ?? "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status || ""} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <CommonDropdown
          onView={() => handleViewHospitalAdmin(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const handleAddHospitalAdmin = (values: any) => {
    if (editData) {
      console.log("Updating Hospital Admin:", values);
    } else {
      console.log("New Hospital Admin:", values);
    }
    queryClient.invalidateQueries({ queryKey: ["hospitalAdmin"] });
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Hospital Admin List</h1>
        <Button
          type="primary"
          icon={<Plus />}
          className="bg-button-primary hover:!bg-button-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Hospital Admin
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          onDownload={handleDownload}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />
        {isFetching ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={hospitalAdmin}
              scroll={{ x: "max-content" }}
              pagination={false}
              rowKey="id"
            />
            <CommonPagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </>
        )}
      </div>

      <AddHospitalAdminModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleAddHospitalAdmin}
        initialData={editData}
      />

      {selectedHospitalAdmin && (
        <ViewSubAdmin
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          subAdminData={selectedHospitalAdmin}
        />
      )}
    </div>
  );
};

export default HospitalAdmin;

