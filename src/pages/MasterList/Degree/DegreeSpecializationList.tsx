import { Button, App, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DegreeAddModal from "./DegreeAddModal";
import DegreeView from "./DegreeView";
import CommonDropdown from "../../Common/CommonActionsDropdown"; // 🔹 Our new table
import StatusBadge from "../../Common/StatusBadge";
import FormattedDate from "../../Common/FormattedDate";
import {
  deleteDegreeApi,
  fetchDegreesApi,
  mergeDegreeApi,
} from "../../../api/degree.api";
import CommonTable from "../../../components/Common/CommonTable";
import { useListController } from "../../../hooks/useListController";
import MergeInstitutionModal, {
  MergeCandidate,
} from "../MergeInstitutionModal";
import { Plus } from "lucide-react";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
  isDuplicate?: boolean;
}

interface DegreeResponse {
  data: DegreeData[];
  total: number;
}

const DegreeSpecializationList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<DegreeData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<DegreeData | null>(null);
  const [mergeSource, setMergeSource] = useState<DegreeData | null>(null);

  /* -------------------- List Controller -------------------- */
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* -------------------- Query -------------------- */
  const { data: degreeResponse, isFetching } = useQuery<DegreeResponse, Error>({
    queryKey: ["degree", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchDegreesApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allDegrees = degreeResponse?.data ?? [];
  const totalCount = degreeResponse?.total ?? 0;

  /* -------------------- Merge candidates -------------------- */
  const { data: mergeCandidatesRaw } = useQuery<DegreeResponse, Error>({
    queryKey: ["degree-merge-candidates"],
    queryFn: () =>
      fetchDegreesApi({ page: 1, limit: 1000, searchValue: "", filterValues: {} }),
    enabled: Boolean(mergeSource),
    staleTime: 60_000,
  });
  const mergeCandidates: MergeCandidate[] = useMemo(() => {
    const list = mergeCandidatesRaw?.data ?? [];
    return list.map((d) => ({
      id: d.id,
      name: d.name,
      hint: d.specialization || undefined,
    }));
  }, [mergeCandidatesRaw]);

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDegreeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree"] });
      message.success("Degree deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete degree");
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeDegreeApi(id, targetId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["degree"] });
      setMergeSource(null);
      message.success(res?.message || "Degree merged successfully");
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to merge degree");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: DegreeData) => {
    setSelectedDegree(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: DegreeData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: DegreeData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.name}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleMerge = (record: DegreeData) => {
    setMergeSource(record);
  };

  /* -------------------- Columns -------------------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        width: 70,
        render: (_: unknown, __: DegreeData, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Degree Name",
        dataIndex: "name",
        render: (name: string, record: DegreeData) => (
          <div className="flex items-center gap-2">
            <span>{name}</span>
            {record.isDuplicate && (
              <Tag color="warning" title="Another degree with the same name exists">
                Duplicate
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: "Specialization",
        dataIndex: "specialization",
      },
      {
        title: "Created On",
        dataIndex: "created_at",
        render: (date: string) => (
          <FormattedDate dateString={date} format="long" />
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status: string) => <StatusBadge status={status.toUpperCase()} />,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: DegreeData) => (
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

  /* -------------------- Filters -------------------- */
  const filterOptions = useMemo(
    () => [
      { label: "Degree Name", key: "name", type: "text" as const },
      { label: "Specialization", key: "specialization", type: "text" as const },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "INACTIVE", "PENDING"],
      },
    ],
    [],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allDegrees.length) return;

    const headers = [
      "S No",
      "Degree Name",
      "Specialization",
      "Created On",
      "Status",
    ];

    const rows = allDegrees.map((row, i) => [
      i + 1,
      row.name,
      row.specialization,
      row.created_at,
      row.status,
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");

    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `degree-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Degree List</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New Degree
        </Button>
      </div>

      <CommonTable<DegreeData>
        rowKey="id"
        columns={columns}
        data={allDegrees}
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

      <DegreeAddModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["degree"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedDegree && (
        <DegreeView
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          degreeData={selectedDegree}
        />
      )}

      <MergeInstitutionModal
        open={Boolean(mergeSource)}
        entityLabel="degree"
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

export default DegreeSpecializationList;
