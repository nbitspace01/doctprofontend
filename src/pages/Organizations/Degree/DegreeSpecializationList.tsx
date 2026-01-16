import { Button, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DegreeAddModal from "./DegreeAddModal";
import DegreeView from "./DegreeView";
import CommonDropdown from "../../Common/CommonActionsDropdown"; // 🔹 Our new table
import StatusBadge from "../../Common/StatusBadge";
import FormattedDate from "../../Common/FormattedDate";
import { deleteDegreeApi, fetchDegreesApi } from "../../../api/degree.api";
import CommonTable from "../../../components/Common/CommonTable";
import { useListController } from "../../../hooks/useListController";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  data: DegreeData[];
  total: number;
}

const DegreeSpecializationList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<DegreeData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<DegreeData | null>(null);

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const { data, isFetching } = useQuery<PaginatedResponse, Error>({
    queryKey: [
      "degreeSpecialization",
      currentPage,
      pageSize,
      searchValue,
      filterValues,
    ],
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

  const degreeList = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDegreeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degreeSpecialization"] });
      message.success("Degree deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete degree");
    },
  });

  const columns = [
    {
      title: "S No",
      width: 70,
      render: (_: unknown, __: DegreeData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Degree Name",
      dataIndex: "name",
    },
    {
      title: "Level",
      dataIndex: "graduation_level",
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "Created On",
      dataIndex: "created_at",
      render: (date: string) => (
        <FormattedDate dateString={date} format="long" />
      ),
    },
    {
      title: "Actions",
      render: (_: unknown, record: DegreeData) => (
        <CommonDropdown
          onView={() => {
            setSelectedDegree(record);
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
    { label: "Degree Name", key: "name", type: "text" as const },
    { label: "Level", key: "graduation_level", type: "text" as const },
    { label: "Specialization", key: "specialization", type: "text" as const },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["ACTIVE", "INACTIVE", "PENDING"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!degreeList.length) return;

    const headers = [
      "S No",
      "Degree Name",
      "Level",
      "Specialization",
      "Status",
      "Created On",
    ];

    const rows = degreeList.map((row, i) => [
      i + 1,
      row.name,
      row.graduation_level,
      row.specialization,
      row.status,
      row.created_at,
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");

    const blob = new Blob([content], {
      type:
        format === "csv"
          ? "text/csv"
          : "application/vnd.ms-excel",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `degree-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Degree & Specialization
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          Add New Degree
        </Button>
      </div>

      <CommonTable<DegreeData>
        rowKey="id"
        columns={columns}
        data={degreeList}
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
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialValues={editData}
        onSave={() => {
          queryClient.invalidateQueries({
            queryKey: ["degreeSpecialization"],
          });
          setIsModalOpen(false);
          setEditData(null);
        }}
      />

      {selectedDegree && (
        <DegreeView
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          degreeId={selectedDegree.id}
        />
      )}
    </div>
  );
};

export default DegreeSpecializationList;
