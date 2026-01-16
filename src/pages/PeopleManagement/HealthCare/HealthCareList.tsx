import React, { useState } from "react";
import { Avatar } from "antd";
import { useQuery } from "@tanstack/react-query";

import CommonTable from "../../../components/Common/CommonTable";
import HealthCareView from "./HealthCareView";
import { useListController } from "../../../hooks/useListController";
import FormattedDate from "../../Common/FormattedDate";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import { fetchHealthcareProfessionalsApi } from "../../../api/healthcare.api"; // assume we move axios call here

interface College {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string | null;
}

interface Hospital {
  id: string;
  name: string;
  branchLocation: string;
  city: string | null;
  state: string;
  country: string | null;
}

export interface HealthcareProfessional {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
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
  isActive: boolean;
  college: College | null;
  hospital: Hospital | null;
  created_at: string;
}

interface PaginatedResponse {
  data: HealthcareProfessional[];
  total: number;
}

const HealthCareList: React.FC = () => {
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<HealthcareProfessional | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const { data, isFetching, error, refetch } = useQuery<
    PaginatedResponse,
    Error
  >({
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

  const professionals = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const getFullName = (p: HealthcareProfessional) =>
    [p.firstName, p.lastName].filter(Boolean).join(" ") || "N/A";

  const columns = [
    {
      title: "S No",
      width: 70,
      render: (_: unknown, __: HealthcareProfessional, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Name",
      dataIndex: "firstName",
      width: 220,
      render: (_: string, record: HealthcareProfessional) => (
        <div className="flex items-center gap-3">
          {record.profilePicture ? (
            <img
              src={record.profilePicture}
              alt={getFullName(record)}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Avatar className="bg-button-primary text-white w-8 h-8 rounded-full">
              {getFullName(record).charAt(0)}
            </Avatar>
          )}
          <span>{getFullName(record)}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", width: 160 },
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
      dataIndex: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            isActive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 100,
      render: (_: any, record: HealthcareProfessional) => (
        <CommonDropdown
          onView={() => {
            setSelectedProfessionalId(record);
            setIsDrawerOpen(true);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          showEdit={false}
          showDelete={false}
        />
      ),
    },
  ];

  const filterOptions = [
    { label: "Name", key: "name", type: "text" as const },
    { label: "Email", key: "email", type: "text" as const },
    { label: "Phone", key: "phone", type: "text" as const },
    { label: "Role", key: "role", type: "text" as const },
    { label: "City", key: "city", type: "text" as const },
    { label: "State", key: "state", type: "text" as const },
    { label: "Country", key: "country", type: "text" as const },
    { label: "Degree", key: "degree", type: "text" as const },
    { label: "Specialization", key: "specialization", type: "text" as const },
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
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!professionals.length) return;

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

    const rows = professionals.map((p, i) => [
      i + 1,
      getFullName(p),
      p.email,
      p.phone,
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

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading data: {error.message}
        <button className="ml-2 underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Healthcare Professionals</h1>

      <CommonTable<HealthcareProfessional>
        rowKey="id"
        columns={columns}
        data={professionals}
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

      <HealthCareView
        professionalData={selectedProfessionalId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default HealthCareList;
