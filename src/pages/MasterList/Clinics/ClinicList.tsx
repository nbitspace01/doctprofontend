import React, { useMemo, useState } from "react";
import { Button, App } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import CommonTable from "../../../components/Common/CommonTable";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import StatusBadge from "../../Common/StatusBadge";

import AddClinicModal, { ClinicData } from "./AddClinicModal";
import ClinicViewDrawer from "./ClinicViewDrawer";

import { useListController } from "../../../hooks/useListController";
import { fetchClinicsApi, deleteClinicApi } from "../../../api/clinic.api";

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

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinicApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
      message.success("Clinic deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete clinic");
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
        render: (_: any, record: ClinicData) => (
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
    </div>
  );
};

export default ClinicList;
