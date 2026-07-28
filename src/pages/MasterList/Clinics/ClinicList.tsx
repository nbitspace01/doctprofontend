import React, { useMemo, useState } from "react";
import { Button, App, Tag } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import CommonTable from "../../../components/Common/CommonTable";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import StatusBadge from "../../Common/StatusBadge";

import AddClinicModal, { ClinicData } from "./AddClinicModal";
import ClinicViewDrawer from "./ClinicViewDrawer";

import { useListController } from "../../../hooks/useListController";
import {
  fetchClinicsApi,
  deleteClinicApi,
  mergeClinicApi,
  fetchClinicListApi,
} from "../../../api/clinic.api";
import MergeInstitutionModal, {
  MergeCandidate,
} from "../MergeInstitutionModal";

interface ClinicResponse {
  data: ClinicData[];
  total: number;
}

const ClinicList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<ClinicData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicData | null>(null);
  const [mergeSource, setMergeSource] = useState<ClinicData | null>(null);

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
  const { data: clinicResponse, isFetching } = useQuery<ClinicResponse, Error>({
    queryKey: ["clinic", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchClinicsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allClinics = clinicResponse?.data || [];
  const totalCount = clinicResponse?.total || 0;

  /* -------------------- Merge candidates (active clinics) -------------------- */
  const { data: mergeCandidatesRaw } = useQuery({
    queryKey: ["clinic-merge-candidates"],
    queryFn: () => fetchClinicListApi(),
    enabled: Boolean(mergeSource),
    staleTime: 60_000,
  });
  const mergeCandidates: MergeCandidate[] = useMemo(() => {
    const list = Array.isArray(mergeCandidatesRaw)
      ? mergeCandidatesRaw
      : (mergeCandidatesRaw as any)?.data ?? [];
    return list.map((c: any) => ({
      id: c.id,
      name: c.name,
      hint: c.district?.name ?? c.branchLocation ?? undefined,
    }));
  }, [mergeCandidatesRaw]);

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinicApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
      message.success("Clinic deleted successfully");
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to delete clinic");
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeClinicApi(id, targetId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
      setMergeSource(null);
      message.success(res?.message || "Clinic merged successfully");
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to merge clinic");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: ClinicData) => {
    setSelectedClinic(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: ClinicData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: ClinicData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.name}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleMerge = (record: ClinicData) => {
    setMergeSource(record);
  };

  /* -------------------- Columns -------------------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        width: 70,
        render: (_: any, __: any, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Clinic Name",
        dataIndex: "name",
        render: (name: string, record: ClinicData) => (
          <div className="flex items-center gap-2">
            <span>{name}</span>
            {record.isDuplicate && (
              <Tag color="warning" title="Another entry with the same name exists in this location">
                Duplicate
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: "Location",
        dataIndex: "branchLocation",
        render: (branchLocation: string) => branchLocation || "N/A",
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status: string) => (
          <StatusBadge status={String(status).toUpperCase()} />
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
        title: "Actions",
        width: 100,
        render: (_: any, record: ClinicData) => (
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
      { label: "Clinic Name", key: "name", type: "text" as const },
      { label: "Location", key: "city", type: "text" as const },
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
    if (!allClinics.length) return;
    const headers = ["S No", "Name", "Location", "Status"];
    const rows = allClinics.map((row, i) => [
      i + 1,
      row.name,
      row.branchLocation || "N/A",
      row.status || "N/A",
    ]);
    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `clinic-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Clinic List</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New Clinic
        </Button>
      </div>

      <CommonTable<ClinicData>
        rowKey="id"
        columns={columns}
        data={allClinics}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={onPageChange}
        filters={filterOptions}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
        searchValue={searchValue}
        onDownload={handleDownload}
      />

      <AddClinicModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ["clinic"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedClinic && (
        <ClinicViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          clinicData={selectedClinic}
        />
      )}

      <MergeInstitutionModal
        open={Boolean(mergeSource)}
        entityLabel="clinic"
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

export default ClinicList;
