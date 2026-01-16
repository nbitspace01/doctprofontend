import React, { useState } from "react";
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
  logoUrl: string | null;
  branchLocation: string;
  status: string;
  updated_at: string;
}

interface HospitalResponse {
  data: HospitalData[];
  total: number;
}

const HospitalList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<HospitalData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] =
    useState<string | null>(null);

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const { data, isFetching } = useQuery<HospitalResponse>({
    queryKey: ["hospital", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchHospitalsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnWindowFocus: false,
  });

  const allHospitals = data?.data || [];
  const totalHospitals = data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteHospitalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital"] });
      message.success("Hospital deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete hospital");
    },
  });

  const columns = [
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
          onView={() => {
            setSelectedHospital(record.id);
            console.log("selected hospital ", selectedHospital);
            setIsViewDrawerOpen(true);
          }}
          onEdit={() => {
            setEditData(record);
            setIsModalOpen(true);
          }}
          onDelete={() =>
            modal.confirm({
              title: "Confirm Delete",
              content: `Delete ${record.name}?`,
              okType: "danger",
              onOk: () => deleteMutation.mutate(record.id),
            })
          }
        />
      ),
    },
  ];

  const filterOptions = [
    { label: "Hospital Name", key: "name", type: "text" as const },
    { label: "Branch Location", key: "branchLocation", type: "text" as const },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["ACTIVE", "INACTIVE"],
    },
  ];

  
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
          Hospital & Clinics Management
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
        data={data?.data ?? []}
        loading={isFetching}
        total={data?.total ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        filters={filterOptions}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        searchValue={searchValue}
        onDownload={handleDownload}
      />

      <AddHospitalModal
        isOpen={isModalOpen}
        isEditing={!!editData}
        initialData={editData}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["hospital"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
      />

      {selectedHospital && (
        <HospitalViewDrawer
          open={isViewDrawerOpen}
          hospitalId={selectedHospital}
          onClose={() => setIsViewDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default HospitalList;
