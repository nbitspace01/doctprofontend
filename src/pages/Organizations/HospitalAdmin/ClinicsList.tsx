import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Avatar, Tag, App } from "antd";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import HospitalRegistration from "./HospitalRegistration";
import ClinicViewDrawer, { HospitalData } from "./ClinicViewDrawer";
import { useListController } from "../../../hooks/useListController";
import CommonTable from "../../../components/Common/CommonTable";
import {
  fetchHospitalAdmin,
  updateHospitalAdminApi,
} from "../../../api/hospitalAdmin.api";
import StatusBadge from "../../Common/StatusBadge";
import { deleteHospitalAdminApi } from "../../../api/hospitalAdmin.api";
import { Plus } from "lucide-react";

interface PaginatedResponse {
  data: HospitalData[];
  total: number;
}

const ClinicsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { modal } = App.useApp();

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editHospital, setEditHospital] = useState<HospitalData | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(
    null,
  );

  const { data, isFetching } = useQuery<PaginatedResponse, Error>({
    queryKey: ["hospitals", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchHospitalAdmin({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const hospitals = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditHospital(null);
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
  };

  const deleteHospitalMutation = useMutation({
    mutationFn: (id: string) => deleteHospitalAdminApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });

  const confirmDeleteHospital = (id: string) => {
    modal.confirm({
      title: "Delete Hospital",
      content: "Are you sure you want to delete this hospital?",
      okText: "Yes, Delete",
      cancelText: "No",
      okType: "danger",
      onOk: () => {
        deleteHospitalMutation.mutate(id);
      },
    });
  };

  const filterOptions = [
    { label: "Name", key: "name", type: "text" as const },
    { label: "Country", key: "country", type: "text" as const },
    { label: "State", key: "state", type: "text" as const },
    { label: "City", key: "city", type: "text" as const },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["ACTIVE", "INACTIVE", "PENDING"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!hospitals.length) return;

    const headers = ["S No", "Name", "Branch Location", "Address", "Status"];
    const rows = hospitals.map((h, i) => [
      i + 1,
      h.name,
      h.branchLocation,
      (h as any).address || "N/A",
      h.status,
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hospitals.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    {
      title: "S No",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Hospital Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: HospitalData) => (
        <div className="flex items-center gap-2">
          {record.logoUrl ? (
            <img
              src={record.logoUrl}
              alt={text}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Avatar className="bg-button-primary text-white w-8 h-8">
              {text.charAt(0)}
            </Avatar>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Branch Location",
      dataIndex: "branchLocation",
      key: "branchLocation",
    },
    {
      title: "Address",
      key: "address",
      render: (_: unknown, record: HospitalData) => {
        const parts = [
          record.branchLocation,
          record.city,
          record.state,
          record.country,
        ]
          .filter(Boolean)
          .join(", ");
        return parts || "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: HospitalData) => (
        <CommonDropdown
          onView={() => setSelectedHospital(record)}
          onEdit={() => {
            setEditHospital(record);
            setIsModalVisible(true);
          }}
          onDelete={() => confirmDeleteHospital(record.id)}
          showEdit={true}
        />
      ),
    },
  ];

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Hospital-Admin List</h1>
        <Button
          type="primary"
          onClick={handleOpenModal}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Add New Hospital Admin
        </Button>
      </div>

      {isModalVisible && (
        <HospitalRegistration
          isOpen={isModalVisible}
          initialData={editHospital}
          onClose={handleCloseModal}
        />
      )}

      <CommonTable<HospitalData>
        rowKey="id"
        columns={columns}
        data={hospitals}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        filters={filterOptions} // you can add filterOptions like HealthCareList if needed
        searchValue={searchValue}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onDownload={handleDownload}
      />

      {selectedHospital && (
        <ClinicViewDrawer
          hospitalData={selectedHospital}
          isOpen={true}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default ClinicsList;
