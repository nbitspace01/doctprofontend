import { Avatar, Button, Image, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import { ApiRequest } from "../Common/constant.function";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import ViewSubAdmin from "./ViewSubAdmin";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import Loader from "../Common/Loader";
import CommonPagination from "../Common/CommonPagination";

interface SubAdminData {
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
      label: "Associated Location",
      key: "associated_location",
    },
    {
      label: "Status",
      key: "status",
      options: ["ACTIVE", "INACTIVE"],
    },
  ];

  const fetchSubAdmin = async (): Promise<SubAdminResponse> => {
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    // seacrh is only if search is true
    const searchParam = searchValue ? `&search=${searchValue}` : "";

    // Build filter parameters only for selected filters
    const filterParams = [];

    // Add text filter values
    if (filterValues.name) {
      filterParams.push(`name=${encodeURIComponent(filterValues.name)}`);
    }
    if (filterValues.location) {
      filterParams.push(
        `location=${encodeURIComponent(filterValues.location)}`
      );
    }
    if (filterValues.associated_location) {
      filterParams.push(
        `associated_location=${encodeURIComponent(
          filterValues.associated_location
        )}`
      );
    }

    // Add checkbox filter values (only selected options)
    if (filterValues.role) {
      const selectedRoles = Object.keys(filterValues).filter(
        (key) => key.startsWith("role_") && filterValues[key]
      );
      if (selectedRoles.length > 0) {
        filterParams.push(
          `role=${selectedRoles
            .map((key) => key.replace("role_", ""))
            .join(",")}`
        );
      }
    }
    if (filterValues.organization_type) {
      const selectedOrgTypes = Object.keys(filterValues).filter(
        (key) => key.startsWith("organization_type_") && filterValues[key]
      );
      if (selectedOrgTypes.length > 0) {
        filterParams.push(
          `organization_type=${selectedOrgTypes
            .map((key) => key.replace("organization_type_", ""))
            .join(",")}`
        );
      }
    }
    if (filterValues.status) {
      const selectedStatuses = Object.keys(filterValues).filter(
        (key) => key.startsWith("status_") && filterValues[key]
      );
      if (selectedStatuses.length > 0) {
        filterParams.push(
          `status=${selectedStatuses
            .map((key) => key.replace("status_", ""))
            .join(",")}`
        );
      }
    }

    const filterParam =
      filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
    const res = await ApiRequest.get(
      `${API_URL}/api/dashboard/sub-admin/list?page=${validPage}&limit=${validLimit}${searchParam}${filterParam}`
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
    queryKey: ["subAdmin", currentPage, pageSize, searchValue, filterValues],
    queryFn: fetchSubAdmin,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const subAdmin = subAdminResponse?.data ?? [];
  const totalCount = subAdminResponse?.total ?? 0;
  console.log("subAdmin", subAdmin);

  const handleDownload = (format: "excel" | "csv") => {
    if (!subAdmin || subAdmin.length === 0) {
      console.log("No data to download");
      return;
    }

    // Define headers based on the data structure
    const headers = [
      "S No",
      "Name",
      "Email Address",
      "Phone Number",
      "Role",
      "Location",
      "Organization Type",
      "Status",
      "Associated Location",
    ];

    // Create rows
    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    subAdmin.forEach((row, index) => {
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${`${row.first_name || ""} ${row.last_name || ""}`.trim()}"`,
        `"${row.email || "N/A"}"`,
        `"${row.phone || "N/A"}"`,
        `"${row.role || "N/A"}"`,
        `"${row.location || "N/A"}"`,
        `"${row.organization_type || "N/A"}"`,
        `"${row.status || "N/A"}"`,
        `"${row.associated_location || "N/A"}"`,
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
    a.download = `subadmin-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
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
      profile_image: record.profile_image || record.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record: SubAdminData) => {
    console.log("Delete:", record);
    // Add your delete logic here
  };

  const handleViewSubAdmin = (subAdmin: SubAdminData) => {
    setSelectedSubAdmin(subAdmin);
    setIsViewDrawerOpen(true);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    console.log("Page changed to:", page, "Page size:", pageSize);
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const columns: ColumnsType<SubAdminData> = [
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
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location) => location ?? "N/A",
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
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
    setFilterValues(filters);
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
              dataSource={subAdmin}
              scroll={{ x: "max-content" }}
              pagination={false}
              // onChange={handleTableChange}
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
