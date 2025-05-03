import { DownloadOutlined, FilterFilled } from "@ant-design/icons";
import { Avatar, Button, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import { TOKEN } from "../Common/constant.function";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "../Common/Loader";

interface SubAdminData {
  key: string;
  sNo: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  orgType: string;
  avatar: string;
  first_name: string;
  last_name: string;
  status: string;
}

const SubAdmin: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchSubAdmin = async () => {
    const token = TOKEN;
    const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
    const res = await axios.get(`${API_URL}/api/dashboard/sub-admin/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res.data, "res.data");
    return res.data;
  };

  const {
    data: subAdmin,
    isLoading: subAdminLoading,
    isError: subAdminError,
  } = useQuery({
    queryKey: ["subAdmin"],
    queryFn: fetchSubAdmin,
  });

  if (subAdminLoading) return <Loader size="large" />;
  if (subAdminError) return <div>Error: "An error occurred"</div>;

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
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white uppercase">
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
      render: (phone) => phone || "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span className="px-3 py-1 text-green-600 bg-green-100 rounded-full text-sm">
          {role?.name || "N/A"}
        </span>
      ),
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
  ];

  const handleAddSubAdmin = (values: any) => {
    console.log("New Sub Admin:", values);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sub-Admin List</h1>
        <Button
          type="primary"
          icon={<Plus />}
          className="bg-blue-700"
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
        dataSource={subAdmin.data}
        pagination={{
          total: subAdmin.total,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        rowKey="id"
      />

      <AddSubAdminModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddSubAdmin}
      />
    </div>
  );
};

export default SubAdmin;
