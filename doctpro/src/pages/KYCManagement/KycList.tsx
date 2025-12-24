import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal, Table, Tag } from "antd";
import { useState } from "react";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { ApiRequest } from "../Common/constant.function";
import FormattedDate from "../Common/FormattedDate";
import DownloadFilterButton from "../Common/DownloadFilterButton";
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
  const [selectedFilters, setSelectedFilters] = useState<any>({});

  const filterOptions = [
    {
      label: "KYC Status",
      key: "kyc_status",
      options: ["pending", "approved", "rejected"],
    },
  ];

  // Place all other hooks before any conditional returns
  const { data: kycData, isFetching } = useQuery({
    queryKey: [
      "kyc-submissions",
      searchValue,
      currentPage,
      pageSize,
      selectedFilters,
    ],
    queryFn: async () => {
      const validPage = currentPage || 1;
      const validLimit = pageSize || 10;
      
      // Convert filters object to URL parameters
      const filterParamsArray: string[] = [];
      
      // Collect all selected status values
      const selectedStatuses: string[] = [];
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (typeof value === "boolean" && value && key.startsWith("kyc_status_")) {
          const statusValue = key.replace("kyc_status_", "");
          selectedStatuses.push(statusValue);
        }
      });

      // Add status parameter if any statuses are selected
      if (selectedStatuses.length > 0) {
        filterParamsArray.push(`status=${selectedStatuses.map(s => encodeURIComponent(s)).join(",")}`);
      }

      // Handle other filter types (text filters, etc.)
      Object.entries(selectedFilters).forEach(([key, value]) => {
        // Skip status filters as they're already handled above
        if (key.startsWith("kyc_status_")) {
          return;
        }
        
        if (value !== "" && value !== false && value !== null && value !== undefined) {
          if (typeof value === "boolean" && value) {
            filterParamsArray.push(`${key}=true`);
          } else {
            filterParamsArray.push(`${key}=${encodeURIComponent(String(value))}`);
          }
        }
      });

      const filterParams = filterParamsArray.length > 0 ? `&${filterParamsArray.join("&")}` : "";
      const searchParam = searchValue ? `&search=${encodeURIComponent(searchValue)}` : "";
      const paginationParam = `?page=${validPage}&limit=${validLimit}`;
      const fullParam = `${paginationParam}${searchParam}${filterParams}`;

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

  const handleFilterChange = (filters: any) => {
    setSelectedFilters(filters);
    setCurrentPage(1);
  };

  const handleDownload = (format: "excel" | "csv") => {
    const data = kycData?.data || kycData || [];
    if (!data || data.length === 0) {
      console.log("No data to download");
      return;
    }

    // Define headers
    const headers = [
      "S No",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Role",
      "ID Proof No.",
      "Created On",
      "KYC Status",
    ];

    // Create rows
    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    data.forEach((row: KycSubmission, index: number) => {
      const values = [
        index + 1,
        `"${row.name || "N/A"}"`,
        `"${row.email || "N/A"}"`,
        `"${row.phone || "N/A"}"`,
        `"${row.role || "N/A"}"`,
        `"${row.kycId || "N/A"}"`,
        `"${row.created_on ? new Date(row.created_on).toLocaleDateString() : "N/A"}"`,
        `"${row.kyc_status || "N/A"}"`,
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
    a.download = `kyc-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">KYC Management</h1>

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          onDownload={handleDownload}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
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
            onShowSizeChange: (size) => {
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
