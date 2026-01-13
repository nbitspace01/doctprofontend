import { Avatar, Button, Image, App } from "antd";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddSubAdminModal from "../SubAdmin/AddSubAdminModal";
import ViewSubAdmin from "./ViewSubAdmin";
import StatusBadge from "../Common/StatusBadge";
import CommonDropdown from "../Common/CommonActionsDropdown";
import CommonTable from "../../components/Common/CommonTable"; // 🔹 Our new table
import { fetchSubAdmin, SubAdminDelete } from "../../api/admin.api";
import { ApiRequest } from "../Common/constant.function";
import { useListController } from "../../hooks/useListController";

interface SubAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location?: string;
  associated_location?: string;
  role: string;
  district?: string;
  state?: string;
  organization_type: string;
  status: string;
  profile_image?: string;
  active_user: boolean;
}

interface SubAdminResponse {
  data: SubAdminData[];
  total: number;
}

const SubAdmin: React.FC = () => {
  const { modal, message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<SubAdminData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdminData | null>(
    null
  );
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

  const { data: subAdminResponse, isFetching } = useQuery<SubAdminResponse, Error>({
    queryKey: [
      "Colleges",
      currentPage,
      pageSize,
      searchValue,
      filterValues, // ✅ REQUIRED
    ],
    queryFn: () =>
      fetchSubAdmin({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allSubAdmins = subAdminResponse?.data ?? [];
  const totalCount = allSubAdmins.length;

  // Columns
  const columns = [
    {
      title: "S No",
      key: "sNo",
      width: 70,
      render: (_: unknown, __: SubAdminData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (_: unknown, record: SubAdminData) => (
        <div className="flex items-center gap-2">
          {record.profile_image ? (
            <Image
              src={record.profile_image}
              width={40}
              height={40}
              alt="Sub Admin"
              className="rounded-full"
            />
          ) : (
            <Avatar size={40} className="bg-button-primary text-white">
              {record.first_name.charAt(0)}
            </Avatar>
          )}
          <span>{`${record.first_name} ${record.last_name}`}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string | undefined) => phone ?? "N/A",
    },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (state: string | undefined) => state ?? "N/A",
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      render: (district: string | undefined) => district ?? "N/A",
    },
    {
      title: "Organization Type",
      dataIndex: "organization_type",
      key: "organization_type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string | undefined) => (
        <StatusBadge status={status || ""} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: SubAdminData) => (
        <CommonDropdown
          onView={() => {
            setSelectedSubAdmin(record);
            setIsViewDrawerOpen(true);
          }}
          onEdit={() => {
            setEditData(record);
            setIsModalOpen(true);
          }}
          onDelete={() => {
            modal.confirm({
              title: "Confirm Delete",
              content: `Delete ${record.first_name} ${record.last_name}?`,
              okType: "danger",
              onOk: () => deleteMutation.mutate(record.id),
            });
          }}
        />
      ),
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SubAdminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subAdmin"] });
      message.success("Sub-admin deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete sub-admin");
    },
  });

  // Inside SubAdmin component
  const filterOptions = [
    { label: "Name", key: "name", type: "text" as const },
    { label: "Email", key: "email", type: "text" as const },
    { label: "Phone", key: "phone", type: "text" as const },
    {
      label: "Role",
      key: "role",
      type: "checkbox" as const,
      options: ["ADMIN", "SUB_ADMIN"],
    },
    { label: "State", key: "state", type: "text" as const },
    { label: "District", key: "district", type: "text" as const },
    {
      label: "Organization Type",
      key: "organization_type",
      type: "checkbox" as const,
      options: ["HOSPITAL", "CLINIC", "PHARMACY"],
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["ACTIVE", "INACTIVE"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!allSubAdmins.length) return;
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
    const rows = allSubAdmins.map((row, i) => [
      i + 1,
      `${row.first_name} ${row.last_name}`,
      row.email || "N/A",
      row.phone || "N/A",
      row.role || "N/A",
      row.state || "N/A",
      row.district || "N/A",
      row.organization_type || "N/A",
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
    a.download = `sub-admin-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sub-Admin List</h1>
        <Button
          type="primary"
          icon={<Plus />}
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          Add New Sub Admin
        </Button>
      </div>

      <CommonTable<SubAdminData>
        rowKey="id"
        columns={columns}
        data={allSubAdmins}
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

      <AddSubAdminModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["subAdmin"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedSubAdmin && (
        <ViewSubAdmin
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          subAdminData={selectedSubAdmin}
        />
      )}
    </div>
  );
};

export default SubAdmin;
