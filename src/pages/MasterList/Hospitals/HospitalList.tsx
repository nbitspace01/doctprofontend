import React, { useMemo, useState } from "react";
import { Button, App, Avatar } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
} from "../../../api/hospital.api";

interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  address: string | null;
  status: "active" | "inactive" | "pending";
  logoUrl: string | null;
  created_at: string;
  updated_at: string;
  updatedAt?: string;
  hospital_id: string | null;
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

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHospitalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital"] });
      message.success("Hospital deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete hospital");
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
            <Avatar size={40} className="bg-button-primary text-white">
              {record.name.charAt(0)}
            </Avatar>
            {record.name}
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
        render: (status: string) => <StatusBadge status={status} />,
      },
      {
        title: "Actions",
        render: (_: any, record: HospitalData) => (
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
      { label: "Hospital Name", key: "name", type: "text" as const },
      {
        label: "Branch Location",
        key: "branchLocation",
        type: "text" as const,
      },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "INACTIVE"],
      },
    ],
    [],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allHospitals.length) return;
    const headers = [
      "S No",
      "Name",
      "Email",
      "Phone",
      "Role",
      "State",
      "District",
      "Organization Type",
      "Status",
    ];
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
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Hospitals Management
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary"
        >
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
    </div>
  );
};

export default HospitalList;
