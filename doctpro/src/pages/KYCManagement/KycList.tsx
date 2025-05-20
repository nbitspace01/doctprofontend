import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Table, Input, Button, Tag, Dropdown, Menu, Modal } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import KycViewDrawer from "./KycViewDrawer";
import { useState } from "react";

interface KycSubmission {
  id: string;
  kycId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_on: string;
  kyc_status: string;
}

const KycList = () => {
  // Fetch KYC submissions using TanStack Query
  const { data: kycData, isLoading } = useQuery({
    queryKey: ["kyc-submissions"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:3000/api/kyc/kyc-submissions",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    },
  });

  const columns = [
    {
      title: "S No",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
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
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <span className="capitalize">{role}</span>,
    },
    {
      title: "ID Proof No.",
      dataIndex: "kycId",
      key: "kycId",
    },
    {
      title: "Created On",
      dataIndex: "created_on",
      key: "created_on",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "KYC Status",
      dataIndex: "kyc_status",
      key: "kyc_status",
      render: (status: string) => {
        let color: string;

        if (status === "approved") {
          color = "success";
        } else if (status === "pending") {
          color = "warning";
        } else {
          color = "error";
        }

        return (
          <Tag color={color} className="capitalize">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: KycSubmission) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" onClick={() => handleView(record)}>
              View
            </Menu.Item>
            <Menu.Item key="edit" onClick={() => handleEdit(record)}>
              Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDelete(record)} danger>
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="link" size="small">
              •••
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const handleView = (record: KycSubmission) => {
    console.log("View:", record);
    setIsDrawerOpen(true);
    setSelectedKycId(record.id);
  };

  const handleEdit = (record: KycSubmission) => {
    // Implement edit logic
    console.log("Edit:", record);
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KycSubmission | null>(
    null
  );

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(
        `http://localhost:3000/api/kyc/kyc-submissions/${id}/delete`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setDeleteModalVisible(false);
      setSelectedRecord(null);
    },
  });

  const handleDelete = (record: KycSubmission) => {
    setSelectedRecord(record);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRecord) {
      deleteMutation.mutate(selectedRecord.id);
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">KYC Management</h1>

      <div className="flex justify-between items-center mb-6">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search"
          className="max-w-xs"
        />
        <div className="flex gap-3">
          <Button icon={<DownloadOutlined />}>Download Report</Button>
          <Button icon={<FilterOutlined />}>Filter by</Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={kycData}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: kycData?.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />

      <KycViewDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        kycId={selectedKycId ?? ""}
      />

      <Modal
        title="Delete KYC"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleConfirmDelete}
        okText="Yes"
        cancelText="Cancel"
        okButtonProps={{
          className: "bg-blue-600",
          loading: deleteMutation.isPending,
        }}
      >
        <p>Are you sure you want to delete this KYC permanently?</p>
      </Modal>
    </div>
  );
};

export default KycList;
