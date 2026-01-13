import { Avatar, Button, Image, Pagination, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import { ApiRequest } from "../Common/constant.function";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ViewSubAdmin from "./ViewSubAdmin";
import SearchFilterDownloadButton from "../Common/SearchFilterDownloadButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import Loader from "../Common/Loader";
import StatusBadge from "../Common/StatusBadge";

interface SubAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  location?: string;
  state?: string;
  district?: string;
  organization_type: string;
  status: string;
  active_user: boolean;
  associated_location: string;
  image_url: string;
  profile_image: string;
}

const SubAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<SubAdminData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdminData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  interface SubAdminResponse {
    data: SubAdminData[];
    total: number;
  }

  const filterOptions = [
    {
      label: "Name",
      key: "name",
      type: "text" as const,
    },
    {
      label: "Email",
      key: "email",
      type: "text" as const,
    },
    {
      label: "Phone",
      key: "phone",
      type: "text" as const,
    },
    {
      label: "Role",
      key: "role",
      type: "checkbox" as const,
      options: ["ADMIN", "SUB_ADMIN"],
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
      options: ["HOSPITAL", "CLINIC", "PHARMACY"],
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["ACTIVE", "INACTIVE"],
    },
  ];

  const fetchSubAdmin = async (): Promise<SubAdminResponse> => {
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    // Fetch all data without pagination for client-side filtering
    const res = await ApiRequest.get(
      `${API_URL}/api/dashboard/sub-admin/list?page=1&limit=10000`
    );

    // Return the full response structure with data and total
    return {
      data: res.data.data ?? [],
      total: res.data.total ?? 0,
    };
  };

  const { data: subAdminResponse, isFetching } = useQuery<
    SubAdminResponse,
    Error
  >({
    queryKey: ["subAdmin"],
    queryFn: fetchSubAdmin,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Get all sub-admins from API
  const allSubAdmins = subAdminResponse?.data ?? [];

  // Extract filter values
  const nameFilter = filterValues.name;
  const emailFilter = filterValues.email;
  const phoneFilter = filterValues.phone;
  const stateFilter = filterValues.state;
  const districtFilter = filterValues.district;
  
  // Collect checkbox filter values
  const roleFilters: string[] = [];
  const orgTypeFilters: string[] = [];
  const statusFilters: string[] = [];
  
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.startsWith("role_") && value === true) {
      roleFilters.push(key.replace("role_", ""));
    }
    if (key.startsWith("organization_type_") && value === true) {
      orgTypeFilters.push(key.replace("organization_type_", ""));
    }
    if (key.startsWith("status_") && value === true) {
      statusFilters.push(key.replace("status_", ""));
    }
  });

  // Apply client-side filtering
  let filteredSubAdmins = allSubAdmins;
  
  // Apply search filter
  if (searchValue) {
    const searchLower = searchValue.toLowerCase().trim();
    filteredSubAdmins = filteredSubAdmins.filter((admin: SubAdminData) => {
      const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        admin.email?.toLowerCase().includes(searchLower) ||
        admin.phone?.toLowerCase().includes(searchLower) ||
        admin.state?.toLowerCase().includes(searchLower) ||
        admin.district?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Apply text filters
  if (nameFilter || emailFilter || phoneFilter || stateFilter || districtFilter || roleFilters.length > 0 || orgTypeFilters.length > 0 || statusFilters.length > 0) {
    filteredSubAdmins = filteredSubAdmins.filter((admin: SubAdminData) => {
      // Name filter
      const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase();
      const matchesName = !nameFilter || fullName.includes(String(nameFilter).toLowerCase().trim());
      
      // Email filter
      const matchesEmail = !emailFilter || admin.email?.toLowerCase().includes(String(emailFilter).toLowerCase().trim());
      
      // Phone filter
      const matchesPhone = !phoneFilter || admin.phone?.toLowerCase().includes(String(phoneFilter).toLowerCase().trim());
      
      // State filter
      const matchesState = !stateFilter || admin.state?.toLowerCase().includes(String(stateFilter).toLowerCase().trim());
      
      // District filter
      const matchesDistrict = !districtFilter || admin.district?.toLowerCase().includes(String(districtFilter).toLowerCase().trim());
      
      // Role filter - normalize and compare (handle "subadmin", "SUB_ADMIN", "admin", etc.)
      const matchesRole = roleFilters.length === 0 || roleFilters.some(filter => {
        if (!admin.role) return false;
        // Normalize both values: remove underscores, spaces, hyphens, convert to uppercase
        const normalizeRole = (role: string) => role.toUpperCase().replace(/[_\s-]/g, "");
        const adminRoleNormalized = normalizeRole(admin.role);
        const filterNormalized = normalizeRole(filter);
        
        // Special handling for SUB_ADMIN vs ADMIN
        if (filterNormalized === "SUBADMIN") {
          // Match if role contains "SUB" and "ADMIN" (but not just "ADMIN")
          return adminRoleNormalized.includes("SUB") && adminRoleNormalized.includes("ADMIN");
        }
        if (filterNormalized === "ADMIN") {
          // Match if role is exactly "ADMIN" (not "SUBADMIN")
          return adminRoleNormalized === "ADMIN";
        }
        // Fallback: exact match after normalization
        return adminRoleNormalized === filterNormalized;
      });
      
      // Organization Type filter
      const matchesOrgType = orgTypeFilters.length === 0 || orgTypeFilters.some(filter => 
        admin.organization_type?.toUpperCase() === filter.toUpperCase()
      );
      
      // Status filter
      const matchesStatus = statusFilters.length === 0 || statusFilters.some(filter => 
        admin.status?.toUpperCase() === filter.toUpperCase()
      );
      
      return matchesName && matchesEmail && matchesPhone && matchesState && matchesDistrict && matchesRole && matchesOrgType && matchesStatus;
    });
  }

  // Apply pagination to filtered results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubAdmins = filteredSubAdmins.slice(startIndex, endIndex);
  
  const totalCount = filteredSubAdmins.length;
  const subAdmin = paginatedSubAdmins;

  const downloadReportCSV = (format: "excel" | "csv") => {
    // Use filtered data for download, not just paginated data
    if (!filteredSubAdmins || filteredSubAdmins.length === 0) {
      return;
    }
    const rows = [];
    const headers = ["S No", "Name", "Email", "Phone", "Role", "State", "District", "Organization Type", "Status"];
    rows.push(headers.join(format === "csv" ? "," : "\t"));
    filteredSubAdmins.forEach((row, index) => {
      const values = [
        index + 1,
        `"${row.first_name} ${row.last_name}"`,
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
    a.download = `sub-admin-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = (record: SubAdminData) => {
    setEditData({
      ...record,
      role: record.role || "",
      location: record.location || "",
      state: record.state || "",
      district: record.district || "",
      profile_image: record.profile_image || record.image_url || "",
    });
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("deleteMutation.mutationFn called with ID:", id);
      const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
      const deleteUrl = `${API_URL}/api/user/delete-sub-admin/${id}`;
      console.log("Delete API URL:", deleteUrl);
      console.log("API_URL:", API_URL);
      
      try {
        const response = await ApiRequest.delete(deleteUrl);
        console.log("Delete API response:", response);
        return response.data;
      } catch (error) {
        console.error("Delete API error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Delete mutation success:", data);
      queryClient.invalidateQueries({ queryKey: ["subAdmin"] });
      message.success("Sub-admin deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete mutation onError:", error);
      console.error("Error response:", error?.response);
      console.error("Error message:", error?.message);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete sub-admin";
      message.error(errorMessage);
    },
  });

  const handleDelete = (record: SubAdminData) => {
    console.log("handleDelete called with record:", record);
    
    if (!record) {
      console.error("Record is null or undefined");
      message.error("Cannot delete: Invalid record data");
      return;
    }
    
    if (!record.id) {
      console.error("Record ID is missing. Record:", record);
      message.error("Cannot delete: Missing record ID");
      return;
    }
    
    console.log("Calling deleteMutation.mutate with ID:", record.id);
    deleteMutation.mutate(record.id);
  };

  const handleViewSubAdmin = (subAdmin: SubAdminData) => {
    setSelectedSubAdmin(subAdmin);
    setIsViewDrawerOpen(true);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    console.log("Page changed to:", page, "Page size:", pageSize);
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const columns: ColumnsType<SubAdminData> = [
    {
      title: "S No",
      key: "sNo",
      width: 70,
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.profile_image ? (
            <Image
              src={record.profile_image}
              width={40}
              height={40}
              alt="Sub Admin"
              className="rounded-full"
            />
          ) : (
            <Avatar
              size={40}
              className="bg-button-primary rounded-full mr-2 text-white"
            >
              {record.first_name.charAt(0)}
            </Avatar>
          )}
          <span>{`${record.first_name} ${record.last_name}`}</span>
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
          onView={() => handleViewSubAdmin(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const handleAddSubAdmin = (values: any) => {
    if (editData) {
      console.log("Updating Sub Admin:", values);
    } else {
      console.log("New Sub Admin:", values);
    }
    queryClient.invalidateQueries({ queryKey: ["subAdmin"] });
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleSearch = (value: string) => {
    console.log("Search value:", value);
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
    setFilterValues(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sub-Admin List</h1>
        <Button
          type="primary"
          icon={<Plus />}
          className="bg-button-primary hover:!bg-button-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Sub Admin
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow w-full">
        <SearchFilterDownloadButton
          onSearch={handleSearch}
          onDownload={downloadReportCSV}
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
              dataSource={subAdmin}
              scroll={{ x: "max-content" }}
              pagination={false}
              // onChange={handleTableChange}
              rowKey="id"
            />
            <div className="flex justify-end my-2 py-3">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      <AddSubAdminModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleAddSubAdmin}
        initialData={editData}
      />

      {selectedSubAdmin && (
        <ViewSubAdmin
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          subAdminData={selectedSubAdmin}
        />
      )}
    </div>
  );
};

export default SubAdmin;
