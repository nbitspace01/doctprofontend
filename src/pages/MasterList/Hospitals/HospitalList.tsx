import React, { useMemo, useState } from "react";
import { Button, App, Tag } from "antd";
import { CrownFilled, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import CommonTable from "../../../components/Common/CommonTable";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import StatusBadge from "../../Common/StatusBadge";

import AddHospitalModal from "./AddHospitalModal";
import HospitalViewDrawer from "./HospitalViewDrawer";

import { useListController } from "../../../hooks/useListController";
import {
  fetchHospitalsApi,
  deleteHospitalApi,
  mergeHospitalApi,
  fetchHospitalListApi,
} from "../../../api/hospital.api";
import MergeInstitutionModal, {
  MergeCandidate,
} from "../MergeInstitutionModal";
import { Plus } from "lucide-react";

interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  isHeadBranch: boolean;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  logoUrl: string | null;
  created_at: string;
  updated_at: string;
  updatedAt?: string;
  isDuplicate?: boolean;
  hospital_id: string | null;
  districtId?: string | null;
  stateId?: string | null;
  stateName?: string | null;
  countryId?: string | null;
  countryName?: string | null;
}

interface HospitalResponse {
  data: HospitalData[];
  total: number;
}

const HospitalList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<HospitalData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(
    null,
  );
  const [mergeSource, setMergeSource] = useState<HospitalData | null>(null);

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
  const { data: hospitalResponse, isFetching } = useQuery<
    HospitalResponse,
    Error
  >({
    queryKey: ["hospital", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchHospitalsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allHospitals = hospitalResponse?.data || [];
  const totalCount = hospitalResponse?.total || 0;

  /* -------------------- Merge candidates (active hospitals) -------------------- */
  const { data: mergeCandidatesRaw } = useQuery({
    queryKey: ["hospital-merge-candidates"],
    queryFn: () => fetchHospitalListApi(),
    enabled: Boolean(mergeSource),
    staleTime: 60_000,
  });
  const mergeCandidates: MergeCandidate[] = useMemo(() => {
    const list = Array.isArray(mergeCandidatesRaw)
      ? mergeCandidatesRaw
      : (mergeCandidatesRaw as any)?.data ?? [];
    return list.map((h: any) => ({
      id: h.id,
      name: h.name,
      hint: h.district?.name ?? h.branchLocation ?? undefined,
    }));
  }, [mergeCandidatesRaw]);

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHospitalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital"] });
      message.success("Hospital deleted successfully");
    },
    onError: (err: any) => {
      // 409 = profiles still reference this hospital; tell the admin to merge.
      message.error(err?.message || "Failed to delete hospital");
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeHospitalApi(id, targetId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["hospital"] });
      setMergeSource(null);
      message.success(res?.message || "Hospital merged successfully");
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to merge hospital");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: HospitalData) => {
    setSelectedHospital(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: HospitalData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: HospitalData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.name}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleMerge = (record: HospitalData) => {
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
        title: "Hospital Name",
        render: (_: any, record: HospitalData) => (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              {record.name}
              {record.isHeadBranch && (
                <CrownFilled className="text-yellow-500" title="Head Branch" />
              )}
            </span>
            {record.isDuplicate && (
              <Tag color="warning" title="Another entry with the same name exists in this location">
                Duplicate
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: "Branch Location",
        dataIndex: "branchLocation",
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status: string) => (
          <StatusBadge status={status.toUpperCase()} />
        ),
      },
      {
        title: "Actions",
        render: (_: any, record: HospitalData) => (
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
      { label: "Hospital Name", key: "name", type: "text" as const },
      { label: "Branch Location", key: "city", type: "text" as const },
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
    if (!allHospitals.length) return;
    const headers = ["S No", "Name", "Branch Location", "Status"];
    const rows = allHospitals.map((row, i) => [
      i + 1,
      `${row.name}`,
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
    a.download = `hospital-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Hospital List</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New Hospital
        </Button>
      </div>

      <CommonTable
        rowKey="id"
        columns={columns}
        data={allHospitals}
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

      <AddHospitalModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["hospital"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedHospital && (
        <HospitalViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          hospitalData={selectedHospital}
        />
      )}

      <MergeInstitutionModal
        open={Boolean(mergeSource)}
        entityLabel="hospital"
        source={mergeSource ? { id: mergeSource.id, name: mergeSource.name } : null}
        candidates={mergeCandidates}
        loading={mergeMutation.isPending}
        onCancel={() => setMergeSource(null)}
        onConfirm={(targetId) =>
          mergeSource &&
          mergeMutation.mutate({ id: mergeSource.id, targetId })
        }
      />
    </div>
  );
};

export default HospitalList;
