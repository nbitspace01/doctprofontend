import React, { useMemo, useState } from "react";
import { Button, App, Tag } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import CommonTable from "../../../components/Common/CommonTable";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import StatusBadge from "../../Common/StatusBadge";

import AddOrganizationModal, { OrganizationData } from "./AddOrganizationModal";
import OrganizationViewDrawer from "./OrganizationViewDrawer";

import { useListController } from "../../../hooks/useListController";
import {
  fetchOrganizationsApi,
  deleteOrganizationApi,
  mergeOrganizationApi,
} from "../../../api/organization.api";
import {
  getOrganizationType,
  type OrganizationTypeSlug,
} from "./organizationTypes";
import MergeInstitutionModal, {
  MergeCandidate,
} from "../MergeInstitutionModal";

interface OrganizationResponse {
  data: OrganizationData[];
  total: number;
}

interface OrganizationListProps {
  /** Which master list this page renders; everything else is derived from it. */
  type: OrganizationTypeSlug;
}

const OrganizationList: React.FC<OrganizationListProps> = ({ type }) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const { label, pluralLabel, queryKey, reportName } =
    getOrganizationType(type);

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<OrganizationData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationData | null>(null);
  const [mergeSource, setMergeSource] = useState<OrganizationData | null>(null);

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
  const { data: organizationResponse, isFetching } = useQuery<
    OrganizationResponse,
    Error
  >({
    queryKey: [queryKey, currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchOrganizationsApi(type, {
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allOrganizations = organizationResponse?.data || [];
  const totalCount = organizationResponse?.total || 0;

  /* -------------------- Merge candidates -------------------- */
  const { data: mergeCandidatesRaw } = useQuery<OrganizationResponse, Error>({
    queryKey: [queryKey, "merge-candidates"],
    queryFn: () =>
      fetchOrganizationsApi(type, {
        page: 1,
        limit: 1000,
        searchValue: "",
        filterValues: {},
      }),
    enabled: Boolean(mergeSource),
    staleTime: 60_000,
  });
  const mergeCandidates: MergeCandidate[] = useMemo(() => {
    const list = mergeCandidatesRaw?.data ?? [];
    return list.map((o: any) => ({
      id: o.id,
      name: o.name,
      hint: o.branchLocation ?? o.district?.name ?? undefined,
    }));
  }, [mergeCandidatesRaw]);

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganizationApi(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      message.success(`${label} deleted successfully`);
    },
    onError: (err: any) => {
      message.error(err?.message || `Failed to delete ${label.toLowerCase()}`);
    },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      mergeOrganizationApi(type, id, targetId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setMergeSource(null);
      message.success(res?.message || `${label} merged successfully`);
    },
    onError: (err: any) => {
      message.error(err?.message || `Failed to merge ${label.toLowerCase()}`);
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: OrganizationData) => {
    setSelectedOrganization(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: OrganizationData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: OrganizationData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.name}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleMerge = (record: OrganizationData) => {
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
        title: `${label} Name`,
        dataIndex: "name",
        render: (name: string, record: OrganizationData) => (
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
        render: (_: any, record: OrganizationData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
            onMerge={record.isDuplicate ? () => handleMerge(record) : undefined}
          />
        ),
      },
    ],
    [currentPage, pageSize, label],
  );

  /* -------------------- Filters -------------------- */
  const filterOptions = useMemo(
    () => [
      { label: `${label} Name`, key: "name", type: "text" as const },
      { label: "Location", key: "city", type: "text" as const },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "INACTIVE", "PENDING"],
      },
    ],
    [label],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allOrganizations.length) return;
    const headers = ["S No", "Name", "Location", "Status"];
    const rows = allOrganizations.map((row, i) => [
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
    a.download = `${reportName}-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{pluralLabel} List</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New {label}
        </Button>
      </div>

      <CommonTable<OrganizationData>
        rowKey="id"
        columns={columns}
        data={allOrganizations}
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

      <AddOrganizationModal
        type={type}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedOrganization && (
        <OrganizationViewDrawer
          type={type}
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          organizationData={selectedOrganization}
        />
      )}

      <MergeInstitutionModal
        open={Boolean(mergeSource)}
        entityLabel={label.toLowerCase()}
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

export default OrganizationList;
