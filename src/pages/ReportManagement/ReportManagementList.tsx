import { App, Tag } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CommonTable from "../../components/Common/CommonTable";
import { useListController } from "../../hooks/useListController";
import CommonDropdown from "../Common/CommonActionsDropdown";
import {
  fetchReportsApi,
  deleteReportApi,
  fetchReportByIdApi,
  exportReportsApi,
} from "../../api/report.api";
import { saveAs } from "file-saver";
import { useMemo, useState } from "react";
import ReportViewDrawer from "./ReportViewDrawer";
import StatusBadge from "../Common/StatusBadge";

interface ReportRow {
  id: string;
  postId?: string;
  reason?: string;
  reportedBy?: { name?: string; email?: string } | string | null;
  status?: string;
  created_at?: string;
}

const ReportManagementList = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const [viewId, setViewId] = useState<string | null>(null);

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const { data, isFetching } = useQuery({
    queryKey: ["reports", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchReportsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const reports: ReportRow[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const { data: viewData, isFetching: viewLoading } = useQuery({
    queryKey: ["report", viewId],
    queryFn: () => fetchReportByIdApi(viewId as string),
    enabled: !!viewId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReportApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      message.success("Report deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete report");
    },
  });

  const handleDelete = (record: ReportRow) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete report ${record.id}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleDownload = async (format: "csv" | "excel") => {
    try {
      const res = await exportReportsApi({ format });
      const blob = new Blob([res as any], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `reports.${format === "excel" ? "xlsx" : "csv"}`);
    } catch (err: any) {
      message.error(err?.message || "Failed to download report");
    }
  };

  const handleView = (record: ReportRow) => {
    setViewId(record.id);
  };

  const columns = useMemo(
    () => [
      {
        title: "S No",
        key: "index",
        render: (_: any, __: any, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Post ID",
        dataIndex: "postId",
        key: "postId",
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
      },
      {
        title: "Reported By",
        dataIndex: "reportedBy",
        key: "reportedBy",
        render: (val: ReportRow["reportedBy"]) => {
          if (!val) return "-";
          if (typeof val === "string") return val;
          return val.name || val.email || "-";
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status?: string) => (
          <StatusBadge status={status ? status.toUpperCase() : "PENDING"} />
        ),
      },
      {
        title: "Created At",
        dataIndex: "created_at",
        key: "created_at",
        render: (date?: string) =>
          date ? new Date(date).toLocaleDateString() : "N/A",
      },
      {
        title: "Actions",
        width: 100,
        render: (_: any, record: ReportRow) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onDelete={() => handleDelete(record)}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  const filterOptions = useMemo(
    () => [
      { label: "Post ID", key: "postId", type: "text" as const },
      { label: "Reason", key: "reason", type: "text" as const },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["REVIEWED", "PENDING"],
      },
    ],
    [],
  );

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold pb-4">Report Management</h1>

      <CommonTable
        rowKey="id"
        columns={columns}
        data={reports}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        filters={filterOptions}
        searchValue={searchValue}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onDownload={handleDownload}
      />

      <ReportViewDrawer
        viewId={viewId}
        onClose={() => setViewId(null)}
        viewData={viewData}
        viewLoading={viewLoading}
      />
    </div>
  );
};

export default ReportManagementList;
