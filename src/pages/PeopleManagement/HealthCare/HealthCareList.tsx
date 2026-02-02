import React, { useMemo, useState } from "react";
import { App, Avatar } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CommonTable from "../../../components/Common/CommonTable";
import HealthCareView from "./HealthCareView";
import { useListController } from "../../../hooks/useListController";
import FormattedDate from "../../Common/FormattedDate";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import {
  deleteHealthcareProfessionalApi,
  fetchHealthcareProfessionalsApi,
} from "../../../api/healthcare.api"; // assume we move axios call here
import StatusBadge from "../../Common/StatusBadge";

interface CollegeData {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string | null;
}

interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  city: string | null;
  state: string;
  country: string | null;
}

interface HealthcareProfessionalData {
  id: string;
  // firstName: string | null;
  // lastName: string | null;
  name: string;
  email: string;
  phoneNumber: string;
  dob: string | null;
  gender: string | null;
  city: string;
  state: string;
  country: string;
  profilePicture: string | null;
  degree: string;
  specialization: string;
  startYear: string | null;
  endYear: string | null;
  role: string;
  startMonth: string | null;
  startYearExp: string | null;
  status: string;
  isActive: boolean;
  college: CollegeData | null;
  hospital: HospitalData | null;
  createdAt: string;
}

interface HealthcareProfessionalResponse {
  data: HealthcareProfessionalData[];
  total: number;
}

const HealthCareList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] =
    useState<HealthcareProfessionalData | null>(null);

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
  const {
    data: healthProfessional,
    isFetching,
    error,
    refetch,
  } = useQuery<HealthcareProfessionalResponse, Error>({
    queryKey: [
      "healthcareProfessionals",
      currentPage,
      pageSize,
      searchValue,
      filterValues,
    ],
    queryFn: () =>
      fetchHealthcareProfessionalsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allProfessionals = healthProfessional?.data ?? [];
  const totalCount = healthProfessional?.total ?? 0;

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHealthcareProfessionalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthcareProfessionals"] });
      message.success("Healthcare Professional deleted successfully");
    },
    onError: (error: any) => {
      message.error(
        error?.message || "Failed to delete healthcare professional",
      );
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: HealthcareProfessionalData) => {
    setSelectedProfessional(record);
    setIsViewDrawerOpen(true);
  };

  const handleDelete = (record: HealthcareProfessionalData) => {
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
        render: (_: unknown, __: HealthcareProfessionalData, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Name",
        dataIndex: "firstName",
        width: 220,
        render: (_: string, record: HealthcareProfessionalData) => (
          <div className="flex items-center gap-3">
            {record.profilePicture ? (
              <img
                src={record.profilePicture}
                alt={record.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Avatar className="bg-button-primary text-white w-8 h-8 rounded-full">
                {record.name.charAt(0)}
              </Avatar>
            )}
            <span>{record.name}</span>
          </div>
        ),
      },
      { title: "Email", dataIndex: "email", width: 220 },
      { title: "Phone", dataIndex: "phoneNumber", width: 160 },
      {
        title: "DOB",
        dataIndex: "dob",
        width: 150,
        render: (dob: string) =>
          dob ? <FormattedDate dateString={dob} format="long" /> : "N/A",
      },
      {
        title: "Gender",
        dataIndex: "gender",
        width: 120,
        render: (g: string) => g || "N/A",
      },
      { title: "City", dataIndex: "city", width: 150 },
      { title: "State", dataIndex: "state", width: 150 },
      { title: "Country", dataIndex: "country", width: 150 },
      { title: "Degree", dataIndex: "degree", width: 150 },
      { title: "Specialization", dataIndex: "specialization", width: 150 },
      { title: "Role", dataIndex: "role", width: 120 },
      {
        title: "Status",
        dataIndex: "status",
        width: 120,
        key: "status",
        render: (status?: string) => <StatusBadge status={status || ""} />,
      },
      {
        title: "Actions",
        width: 100,
        render: (_: any, record: HealthcareProfessionalData) => (
          <CommonDropdown
            onView={() => handleView(record)}
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
      { label: "Name", key: "name", type: "text" as const },
      { label: "Email", key: "email", type: "text" as const },
      { label: "Phone", key: "phoneNumber", type: "text" as const },
      { label: "City", key: "city", type: "text" as const },
      { label: "State", key: "state", type: "text" as const },
      { label: "Country", key: "country", type: "text" as const },
      { label: "Degree", key: "degree", type: "text" as const },
      { label: "Specialization", key: "specialization", type: "text" as const },
      { label: "Role", key: "role", type: "text" as const },
      {
        label: "Gender",
        key: "gender",
        type: "checkbox" as const,
        options: ["Male", "Female", "Other"],
      },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["Active", "Inactive"],
      },
    ],
    [],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allProfessionals.length) return;

    const headers = [
      "S No",
      "Name",
      "Email",
      "Phone",
      "DOB",
      "Gender",
      "City",
      "State",
      "Country",
      "Degree",
      "Specialization",
      "Role",
      "Status",
    ];

    const rows = allProfessionals.map((p, i) => [
      i + 1,
      p.name,
      p.email,
      p.phoneNumber,
      p.dob || "N/A",
      p.gender || "N/A",
      p.city,
      p.state,
      p.country,
      p.degree,
      p.specialization,
      p.role,
      p.isActive ? "Active" : "Inactive",
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `healthcare-professionals.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold pb-4">Healthcare Professionals</h1>

      <CommonTable<HealthcareProfessionalData>
        rowKey="id"
        columns={columns}
        data={allProfessionals}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        filters={filterOptions}
        searchValue={searchValue}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onDownload={handleDownload}
      />

      {selectedProfessional && (
        <HealthCareView
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          professionalData={selectedProfessional}
        />
      )}
    </div>
  );
};

export default HealthCareList;
