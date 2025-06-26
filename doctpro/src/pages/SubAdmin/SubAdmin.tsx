import { Avatar, Button, Image, Pagination, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import { ApiRequest } from "../Common/constant.function";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import ViewSubAdmin from "./ViewSubAdmin";
import SearchFilterDownloadButton from "../Common/SearchFilterDownloadButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import Loader from "../Common/Loader";

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
  const queryClient = useQueryClient();
  interface SubAdminResponse {
    data: SubAdminData[];
    total: number;
  }

  const fetchSubAdmin = async (): Promise<SubAdminResponse> => {
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const res = await ApiRequest.get(
      `${API_URL}/api/dashboard/sub-admin/list?page=${validPage}&limit=${validLimit}`
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
    queryKey: ["subAdmin", currentPage, pageSize],
    queryFn: fetchSubAdmin,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  if (isFetching) {
    return <Loader size="large" />;
  }

  const subAdmin = subAdminResponse?.data ?? [];
  const totalCount = subAdminResponse?.total ?? 0;
  console.log("subAdmin", subAdmin);

  const downloadReportCSV = () => {
    console.log("downloadReportCSV");
    const csvRows = [];
    const headers = Object.keys(subAdmin[0]);
    csvRows.push(headers.join(","));
    subAdmin.forEach((row) => {
      const values = headers.map((header) => row[header as keyof SubAdminData]);
      csvRows.push(values.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
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
        <SearchFilterDownloadButton onDownload={downloadReportCSV} />
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
