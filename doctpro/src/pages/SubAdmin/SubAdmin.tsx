import {
  DownloadOutlined,
  FilterFilled,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Input, Table, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import { TOKEN } from "../Common/constant.function";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../Common/Loader";
import ViewSubAdmin from "./ViewSubAdmin";

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
}

const SubAdmin: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<SubAdminData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdminData | null>(
    null
  );
  const queryClient = useQueryClient();

  const fetchSubAdmin = async () => {
    const token = TOKEN;
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const res = await axios.get(`${API_URL}/api/dashboard/sub-admin/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API Response:", res.data);

    return res.data.data ?? [];
  };

  const {
    data: rawSubAdmin,
    isLoading: subAdminLoading,
    isError: subAdminError,
  } = useQuery({
    queryKey: ["subAdmin"],
    queryFn: fetchSubAdmin,
  });

  if (subAdminLoading) return <Loader size="large" />;
  if (subAdminError) return <div>Error: An error occurred</div>;

  const subAdmin = Array.isArray(rawSubAdmin) ? rawSubAdmin : [];

  const handleEdit = (record: SubAdminData) => {
    setEditData({
      ...record,
      role: record.role || "",
      location: record.location || "",
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

  const columns: ColumnsType<SubAdminData> = [
    {
      title: "S No",
      key: "sNo",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-button-primary flex items-center justify-center !text-white uppercase">
            {record.first_name.charAt(0)}
          </div>
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
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                icon: <EyeOutlined />,
                label: "View",
                onClick: () => handleViewSubAdmin(record),
              },
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit",
                onClick: () => handleEdit(record),
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                onClick: () => handleDelete(record),
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          />
        </Dropdown>
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

      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-4">
          <Button
            icon={<DownloadOutlined />}
            className="flex items-center text-blue-600"
          >
            Download Report
          </Button>
          <Button icon={<FilterFilled />} className="flex items-center">
            Filter by
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={subAdmin}
        pagination={{
          total: subAdmin.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        rowKey="id"
      />

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
