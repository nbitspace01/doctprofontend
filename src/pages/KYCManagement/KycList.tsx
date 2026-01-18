import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Modal, Table, Tag } from "antd";
import { useMemo, useState } from "react";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { ApiRequest } from "../Common/constant.function";
import FormattedDate from "../Common/FormattedDate";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonPagination from "../Common/CommonPagination";
import KycViewDrawer from "./KycViewDrawer";
import { fetchKYCApi } from "../../api/kyc.api";
import { useListController } from "../../hooks/useListController";
import { Loader, Plus } from "lucide-react";
import CommonTable from "../../components/Common/CommonTable";

/* ---------- TYPES ---------- */
interface KYCData {
  id: string;
  kycId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_on: string;
  kyc_status: string;
}

interface KYCResponse {
  data: KYCData[];
  total: number;
}

const KycList: React.FC = () => {
  // const { modal, message } = App.useApp();
  // const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCData | null>(null);

  /* ---------- LIST CONTROLLER ---------- */
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* ---------- QUERY ---------- */
  const { data: KYCResponse, isFetching } = useQuery<KYCResponse, Error>({
    queryKey: ["KYC", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchKYCApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allKYC = KYCResponse?.data ?? [];
  const totalCount = KYCResponse?.total ?? 0;

  /* ---------- MUTATION ---------- */
  // const deleteMutation = useMutation({
  //   mutationFn: (id: string) => deleteCollegeApi(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["colleges"] });
  //     message.success("College deleted successfully");
  //   },
  //   onError: (error: any) => {
  //     message.error(error?.message || "Failed to delete college");
  //   },
  // });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: KYCData) => {
    setSelectedKYC(record);
    setIsViewDrawerOpen(true);
  };

  // const handleEdit = (record: KYCData) => {
  //   setEditData(record);
  //   setIsModalOpen(true);
  // };

  // const handleDelete = (record: KYCData) => {
  //   modal.confirm({
  //     title: "Confirm Delete",
  //     content: `Delete ${record.name}?`,
  //     okType: "danger",
  //     onOk: () => deleteMutation.mutate(record.id),
  //   });
  // };

  const filterOptions = [
    {
      label: "KYC Status",
      key: "kyc_status",
      options: ["pending", "approved", "rejected"],
    },
  ];

  /* ---------- COLUMNS ---------- */
  const columns = useMemo(
    () => [
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

          if (status === "APPROVED") {
            color = "success";
          } else if (status === "PENDING") {
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
        render: (_: any, record: KYCData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            // onEdit={() => handleEdit(record)}
            // onDelete={() => handleDelete(record)}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  const handleDownload = (format: "excel" | "csv") => {
    const data = allKYC || [];
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

    data.forEach((row: KYCData, index: number) => {
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
    const mimeType =
      format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">KYC Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
          <CommonTable
            rowKey="id"
            columns={columns}
            data={allKYC}
            loading={isFetching}
            currentPage={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onPageChange={onPageChange}
            filters={filterOptions}
            onFilterChange={onFilterChange}
            onSearch={onSearch}
            searchValue={searchValue}
            onDownload={handleDownload}
          />
      </div>

      {/* VIEW DRAWER */}
      {selectedKYC && (
        <KycViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          kycId={selectedKYC.id}
        />
      )}
    </div>
  );
};

export default KycList;
