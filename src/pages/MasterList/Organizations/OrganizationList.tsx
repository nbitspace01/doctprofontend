import React, { useMemo, useState } from "react";
import { Button, App } from "antd";
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
} from "../../../api/organization.api";
import {
  getOrganizationType,
  type OrganizationTypeSlug,
} from "./organizationTypes";

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

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganizationApi(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      message.success(`${label} deleted successfully`);
    },
    onError: () => {
      message.error(`Failed to delete ${label.toLowerCase()}`);
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
        title: "Actions",
        width: 100,
        render: (_: any, record: OrganizationData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
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
    </div>
  );
};

export default OrganizationList;
