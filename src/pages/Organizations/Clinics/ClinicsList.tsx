import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Avatar, Tag } from "antd";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import HospitalRegistration from "../../Registration/Hospital/HospitalRegistration";
import ClinicViewDrawer from "./ClinicViewDrawer";
import { useListController } from "../../../hooks/useListController";
import CommonTable from "../../../components/Common/CommonTable";
import { fetchHospitalAdmin } from "../../../api/admin.api";
import { apiClient } from "../../../api/api";

interface Hospital {
  id: string;
  name: string;
  branchLocation: string;
  address: string;
  status: "Active" | "Inactive" | "Pending" | "pending";
  logoUrl?: string;
}

interface PaginatedResponse {
  data: Hospital[];
  total: number;
}

const ClinicsList: React.FC = () => {
  const queryClient = useQueryClient();

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
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );

  const { data, isFetching } = useQuery<
    PaginatedResponse,
    Error
  >({
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
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
  };

  const filterOptions = [
    { label: "Name", key: "name", type: "text" as const },
    { label: "Branch Location", key: "branchLocation", type: "text" as const },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Inactive", "Pending"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!hospitals.length) return;

    const headers = ["S No", "Name", "Branch Location", "Address", "Status"];
    const rows = hospitals.map((h, i) => [
      i + 1,
      h.name,
      h.branchLocation,
      h.address || "N/A",
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
      title: "Hospital/Clinic Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Hospital) => (
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
      dataIndex: "address",
      key: "address",
      render: (address: string) =>
        address === "null, null, null" ? "N/A" : address || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Active"
              ? "success"
              : status === "Inactive"
              ? "error"
              : "warning"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Hospital) => (
        <CommonDropdown
          onView={() => setSelectedHospitalId(record.id)}
          onEdit={() => {}}
          onDelete={() => {apiClient.delete(`/api/hospital-admin/${record.id}`)}}
          showEdit={false}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Hospital Management
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
          className="bg-button-primary"
        >
          Add New Hospital & Clinics
        </Button>
      </div>

      {isModalVisible && (
        <HospitalRegistration
          isOpen={isModalVisible}
          onClose={handleCloseModal}
        />
      )}

      <CommonTable<Hospital>
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

      {selectedHospitalId && (
        <ClinicViewDrawer
          hospitalId={selectedHospitalId}
          isOpen={true}
          onClose={() => setSelectedHospitalId(null)}
        />
      )}
    </div>
  );
};

export default ClinicsList;
