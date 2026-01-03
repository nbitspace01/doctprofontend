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

interface HospitalAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  organization_type: string;
  status: string;
  active_user: boolean;
  associated_location: string;
  image_url: string;
  profile_image: string;
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
    },
    {
      label: "Email Address",
      key: "email",
    },
    {
      label: "Phone Number",
      key: "phone",
    },
    {
      label: "Role",
      key: "role",
      options: ["ADMIN", "SUB_ADMIN"],
    },
    {
      label: "Location",
      key: "location",
    },
    {
      label: "Organization Type",
      key: "organization_type",
      options: ["HOSPITAL", "CLINIC", "PHARMACY"],
    },
    {
      label: "Status",
      key: "status",
      options: ["ACTIVE", "INACTIVE"],
    },
  ];

  const fetchHospitalAdmin = async (): Promise<HospitalAdminResponse> => {
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const searchParam = searchValue ? `&search=${searchValue}` : "";

    // Build filter parameters
    const filterParams: string[] = [];
    
    // Handle name filter
    if (filterValues.name && String(filterValues.name).trim()) {
      filterParams.push(`name=${encodeURIComponent(String(filterValues.name).trim())}`);
    }
    
    // Handle location filter
    if (filterValues.location && String(filterValues.location).trim()) {
      filterParams.push(
        `location=${encodeURIComponent(String(filterValues.location).trim())}`
      );
    }

    // Handle checkbox-style filters (role, organization_type, status)
    const selectedRoles = Object.keys(filterValues).filter(
      (key) => key.startsWith("role_") && filterValues[key]
    );
    if (selectedRoles.length > 0) {
      const roleValues = selectedRoles.map((key) => {
        const filterValue = key.replace("role_", "");
        return encodeURIComponent(filterValue);
      });
      filterParams.push(`role=${roleValues.join(",")}`);
    }
    
    const selectedOrgTypes = Object.keys(filterValues).filter(
      (key) => key.startsWith("organization_type_") && filterValues[key]
    );
    if (selectedOrgTypes.length > 0) {
      const orgTypeValues = selectedOrgTypes.map((key) => {
        const filterValue = key.replace("organization_type_", "");
        return encodeURIComponent(filterValue);
      });
      filterParams.push(`organization_type=${orgTypeValues.join(",")}`);
    }
    
    const selectedStatuses = Object.keys(filterValues).filter(
      (key) => key.startsWith("status_") && filterValues[key] === true
    );
    if (selectedStatuses.length > 0) {
      const statusValues = selectedStatuses.map((key) => {
        const filterValue = key.replace("status_", "");
        return encodeURIComponent(filterValue);
      });
      filterParams.push(`status=${statusValues.join(",")}`);
    }

    const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
    
    const fullUrl = `${API_URL}/api/user/hospital-admins?page=${validPage}&limit=${validLimit}${searchParam}${filterParam}`;
    console.log("Hospital Admin API URL:", fullUrl);
    
    const res = await ApiRequest.get(fullUrl);

    // Handle different response structures
    // If response is an array directly
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        total: res.data.length,
      };
    }
    
    // If response has data and total properties
    if (res.data && res.data.data) {
      return {
        data: res.data.data ?? [],
        total: res.data.total ?? res.data.data?.length ?? 0,
      };
    }

    // Fallback: return empty array
    return {
      data: [],
      total: 0,
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

  // Apply client-side filtering for email and phone if API doesn't support them
  let filteredHospitalAdmin = hospitalAdminResponse?.data ?? [];
  const emailFilter = filterValues.email;
  const phoneFilter = filterValues.phone;
  
  if (emailFilter || phoneFilter) {
    filteredHospitalAdmin = filteredHospitalAdmin.filter((admin: HospitalAdminData) => {
      const matchesEmail = !emailFilter || 
        (admin.email && admin.email.toLowerCase().includes(String(emailFilter).toLowerCase().trim()));
      const matchesPhone = !phoneFilter || 
        (admin.phone && admin.phone.toLowerCase().includes(String(phoneFilter).toLowerCase().trim()));
      return matchesEmail && matchesPhone;
    });
  }

  const hospitalAdmin = filteredHospitalAdmin;
  // Use filtered count if client-side filtering is applied, otherwise use API total
  const totalCount = (emailFilter || phoneFilter) 
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
      "Location",
      "Organization Type",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    hospitalAdmin.forEach((row, index) => {
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${`${row.first_name || ""} ${row.last_name || ""}`.trim()}"`,
        `"${row.email || "N/A"}"`,
        `"${row.phone || "N/A"}"`,
        `"${row.role || "N/A"}"`,
        `"${row.location || "N/A"}"`,
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
    setEditData({
      ...record,
      role: record.role || "",
      location: record.location || "",
      profile_image: record.profile_image || record.image_url || "",
    });
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
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location) => location ?? "N/A",
    },
    {
      title: "Districts",
      dataIndex: "districts",
      key: "districts",
      render: (districts) => districts ?? "N/A",
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
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {status}
        </span>
      ),
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

