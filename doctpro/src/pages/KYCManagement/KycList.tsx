import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal, Table, Tag } from "antd";
import { useState } from "react";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { ApiRequest } from "../Common/constant.function";
import FormattedDate from "../Common/FormattedDate";
import SearchFilterDownloadButton from "../Common/SearchFilterDownloadButton";
import KycViewDrawer from "./KycViewDrawer";

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
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const queryClient = useQueryClient();

  // Group all useState hooks at the top
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<KycSubmission | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchParam = searchValue ? `&search=${searchValue}` : "";
  const paginationParam = `?page=${currentPage}&limit=${pageSize}`;
  const fullParam = `${paginationParam}${searchParam}`;

  // Place all other hooks before any conditional returns
  const { data: kycData, isFetching } = useQuery({
    queryKey: ["kyc-submissions", searchValue, currentPage, pageSize],
    queryFn: async () => {
      const response = await ApiRequest.get(
        `${API_URL}/api/kyc/kyc-submissions${fullParam}`
      );
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await ApiRequest.post(`${API_URL}/api/kyc/kyc-submissions/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setDeleteModalVisible(false);
      setSelectedRecord(null);
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
      render: (date: string) => (
        <FormattedDate dateString={date} format="long" />
      ),
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
        return (
          <CommonDropdown
            onView={() => {
              handleView(record);
            }}
            onEdit={() => {
              handleEdit(record);
            }}
            onDelete={() => {
              handleDelete(record);
            }}
            showView={true}
            showEdit={false}
            showDelete={true}
          />
        );
      },
    },
  ];

  const handleView = (record: KycSubmission) => {
    setIsDrawerOpen(true);
    setSelectedKycId(record.id);
  };

  const handleEdit = (record: KycSubmission) => {
    // Implement edit logic
    console.log("Edit:", record);
  };

  const handleDelete = (record: KycSubmission) => {
    setSelectedRecord(record);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRecord) {
      deleteMutation.mutate(selectedRecord.id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">KYC Management</h1>

      <div className="bg-white rounded-lg shadow w-full">
        <SearchFilterDownloadButton
          onSearch={handleSearch}
          searchValue={searchValue}
        />

        <Table
          columns={columns}
          dataSource={kycData?.data || kycData || []}
          scroll={{ x: "max-content" }}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: kycData?.total || kycData?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: ( size) => {
              setCurrentPage(1);
              setPageSize(size);
            },
          }}
          loading={isFetching}
        />
      </div>
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
