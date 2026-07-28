import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, App, Tag } from "antd";
import { Plus } from "lucide-react";

import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CollegeViewDrawer from "./CollegeViewDrawer";
import StatusBadge from "../../Common/StatusBadge";
import CommonTable from "../../../components/Common/CommonTable";

import { useListController } from "../../../hooks/useListController";
import {
  deleteCollegeApi,
  fetchCollegesApi,
  mergeCollegeApi,
} from "../../../api/college.api";
import MergeInstitutionModal, {
  MergeCandidate,
} from "../MergeInstitutionModal";

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
  isDuplicate?: boolean;
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
  const [mergeSource, setMergeSource] = useState<CollegeData | null>(null);

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

  /* -------------------- Merge candidates -------------------- */
  const { data: mergeCandidatesRaw } = useQuery<CollegeResponse, Error>({
    queryKey: ["college-merge-candidates"],
    queryFn: () =>
      fetchCollegesApi({ page: 1, limit: 1000, searchValue: "", filterValues: {} }),
    enabled: Boolean(mergeSource),
    staleTime: 60_000,
  });
  const mergeCandidates: MergeCandidate[] = useMemo(() => {
    const list = mergeCandidatesRaw?.data ?? [];
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      hint: [c.district, c.state].filter(Boolean).join(", ") || undefined,
    }));
  }, [mergeCandidatesRaw]);

  /* ---------- MUTATION ---------- */
  const mergeMutation = useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeCollegeApi(id, targetId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setMergeSource(null);
      message.success(res?.message || "College merged successfully");
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to merge college");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollegeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      message.success("College deleted successfully");
    },
    onError: (error: any) => {
      const apiMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete college";
      const linkedStudent =
        apiMsg.toLowerCase().includes("student") ||
        apiMsg.toLowerCase().includes("referenc");
      if (linkedStudent) {
        message.error("Unable to delete, student linked with this college");
      } else {
        message.error(apiMsg);
      }
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

  const handleMerge = (record: CollegeData) => {
    setMergeSource(record);
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
            {record.isDuplicate && (
              <Tag color="warning" title="Another entry with the same name exists in this city">
                Duplicate
              </Tag>
            )}
          </div>
        ),
      },

      { title: "District", dataIndex: "district" },
      { title: "State", dataIndex: "state" },
      {
        title: "Created On",
        dataIndex: "created_at",
        render: (date: string) =>
          date ? new Date(date).toLocaleDateString("en-IN") : "-",
      },

      {
        title: "Status",
        dataIndex: "status",
        render: (status?: string) => (
          <StatusBadge status={status?.toUpperCase() || ""} />
        ),
      },

      {
        title: "Submitted Phone",
        dataIndex: "submitter_phone",
        render: (phone: string | null | undefined) =>
          phone ? (
            <a href={`tel:${phone}`} className="text-blue-600">
              {phone}
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },

      {
        title: "Action",
        render: (_: any, record: CollegeData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
            onMerge={record.isDuplicate ? () => handleMerge(record) : undefined}
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
      "Created On",
      "Status",
    ];

    const rows = allColleges.map((row, i) => [
      i + 1,
      `${row.name}`,
      row.district || "N/A",
      row.state || "N/A",
      row.created_at || "N/A",
      row.status || "N/A",
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
      { label: "College Name", key: "name", type: "text" as const },
      { label: "District", key: "district", type: "text" as const },
      { label: "State", key: "state", type: "text" as const },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "PENDING", "INACTIVE"],
      },
    ],
    [],
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">College List</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
                   px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New College
        </Button>
      </div>

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

      <MergeInstitutionModal
        open={Boolean(mergeSource)}
        entityLabel="college"
        source={mergeSource ? { id: mergeSource.id, name: mergeSource.name } : null}
        candidates={mergeCandidates}
        loading={mergeMutation.isPending}
        onCancel={() => setMergeSource(null)}
        onConfirm={(targetId) =>
          mergeSource && mergeMutation.mutate({ id: mergeSource.id, targetId })
        }
      />
    </div>
  );
};

export default CollegeList;
