import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";

import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CollegeViewDrawer from "./CollegeViewDrawer";
import StatusBadge from "../../Common/StatusBadge";
import CommonTable from "../../../components/Common/CommonTable";

import { useListController } from "../../../hooks/useListController";
import { deleteCollegeApi, fetchCollegesApi } from "../../../api/college.api";

/* ---------- TYPES ---------- */
export interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  name: string;
  state: string;
  district: string;
  hospitals: any[];
  created_at: string;
  status: "active" | "pending" | "inactive";
}

interface CollegeResponse {
  data: CollegeData[];
  total: number;
}

/* ---------- COMPONENT ---------- */
const CollegeList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<CollegeData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<CollegeData | null>(
    null,
  );

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
  const { data: collegeResponse, isFetching } = useQuery<
    CollegeResponse,
    Error
  >({
    queryKey: ["colleges", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchCollegesApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allColleges = collegeResponse?.data ?? [];
  const totalCount = collegeResponse?.total ?? 0;

  /* ---------- MUTATION ---------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollegeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      message.success("College deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete college");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: CollegeData) => {
    setSelectedCollege(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: CollegeData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: CollegeData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.name}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  /* ---------- COLUMNS ---------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        dataIndex: "sNo",
        width: 70,
        render: (_: unknown, __: CollegeData, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },

      {
        title: "College Name",
        dataIndex: "name",
        render: (_: unknown, record: CollegeData) => (
          <div className="flex items-center gap-3">
            {record.logo ? (
              <img src={record.logo} className="w-10 h-10 rounded-full" />
            ) : (
              <Avatar className="bg-button-primary">
                {record.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            )}
            <span>{record.name}</span>
          </div>
        ),
      },

      { title: "District", dataIndex: "district" },
      { title: "State", dataIndex: "state" },

      {
        title: "Associated Hospital",
        dataIndex: "hospitals",
        render: (hospitals: any[] = []) =>
          hospitals.length ? hospitals.map((h) => h?.name).join(", ") : "N/A",
      },

      {
        title: "Created On",
        dataIndex: "created_at",
        render: (date: string) =>
          date ? new Date(date).toLocaleDateString("en-IN") : "-",
      },

      {
        title: "Status",
        dataIndex: "status",
        render: (status?: string) => <StatusBadge status={status || ""} />,
      },

      {
        title: "Action",
        render: (_: any, record: CollegeData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allColleges.length) return;

    const headers = [
      "S No",
      "College Name",
      "District",
      "State",
      "Associated Hospital",
      "Status",
      "Created On",
    ];

    const rows = allColleges.map((row, i) => [
      i + 1,
      `${row.name}`,
      row.district || "N/A",
      row.state || "N/A",
      row.hospitals || "N/A",
      row.status || "N/A",
      row.created_at || "N/A",
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");

    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sub-admin-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------- FILTER OPTIONS ---------- */
  const filterOptions = useMemo(
    () => [
      { label: "College Name", key: "name", type: "text" },
      { label: "State", key: "state", type: "text" },
      { label: "District", key: "district", type: "text" },
      {
        label: "Status",
        key: "status",
        type: "checkbox",
        options: ["Active", "Pending", "Unactive"],
      },
    ],
    [],
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Colleges</h1>
        <Button
          type="primary"
          icon={<Plus />}
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          Add New College
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <Loader size="large" />
          </div>
        ) : (
          <CommonTable
            rowKey="id"
            columns={columns}
            data={allColleges}
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
        )}
      </div>

      {/* CREATE + EDIT MODAL */}
      <AddCollegeModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["colleges"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {/* VIEW DRAWER */}
      {selectedCollege && (
        <CollegeViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          collegeData={selectedCollege}
        />
      )}
    </div>
  );
};

export default CollegeList;
