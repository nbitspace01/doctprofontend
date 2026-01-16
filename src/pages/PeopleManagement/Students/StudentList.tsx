import { Avatar } from "antd";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import FormattedDate from "../../Common/FormattedDate";
import StudentView from "./StudentView";

import { useListController } from "../../../hooks/useListController";
import CommonTable from "../../../components/Common/CommonTable";
import { fetchStudentsApi } from "../../../api/student.api";
import CommonDropdown from "../../Common/CommonActionsDropdown";

interface Student {
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  collegeName: string;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  kycStatus: boolean;
  userStatus: string;
}

interface PaginatedResponse {
  data: Student[];
  total: number;
}

const StudentList: React.FC = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

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
      "students",
      currentPage,
      pageSize,
      searchValue,
      filterValues,
    ],
    queryFn: () =>
      fetchStudentsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // console.log("dta", data);
  const students = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const columns = [
    {
      title: "S No",
      width: 70,
      render: (_: unknown, __: Student, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      width: 260,
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-button-primary text-white">
            {text?.charAt(0)}
          </Avatar>
          <span>{text}</span>
        </div>
      ),
    },
    { title: "Student ID", dataIndex: "studentId", width: 180 },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", width: 160 },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 120,
      render: (v: string) => v || "N/A",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      width: 170,
      render: (dob: string) =>
        dob ? <FormattedDate dateString={dob} format="long" /> : "N/A",
    },
    { title: "College", dataIndex: "college", width: 220 },
    { title: "Degree", dataIndex: "degree", width: 180 },
    { title: "Specialization", dataIndex: "specialization", width: 180 },
    {
      title: "KYC Status",
      dataIndex: "kycStatus",
      width: 150,
      render: (status: boolean) => (
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            status
              ? "text-green-600 bg-green-50"
              : "text-orange-500 bg-orange-50"
          }`}
        >
          {status ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      title: "Account Status",
      dataIndex: "userStatus",
      width: 150,
      render: (status: string) => (
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            status?.toLowerCase() === "active"
              ? "text-green-600 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 100,
      render: (_: any, record: Student) => (
        <CommonDropdown
          onView={() => {
            setSelectedStudentId(record.studentId);
            setIsViewOpen(true);
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
    { label: "Student Name", key: "studentName", type: "text" as const },
    { label: "Student ID", key: "studentId", type: "text" as const },
    { label: "Email", key: "email", type: "text" as const },
    { label: "Phone", key: "phone", type: "text" as const },
    {
      label: "Gender",
      key: "gender",
      type: "checkbox" as const,
      options: ["Male", "Female"],
    },
    {
      label: "KYC Status",
      key: "kycStatus",
      type: "checkbox" as const,
      options: ["Verified", "Pending"],
    },
    {
      label: "Account Status",
      key: "userStatus",
      type: "checkbox" as const,
      options: ["Active", "Inactive"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!students.length) return;

    const headers = [
      "S No",
      "Student Name",
      "Student ID",
      "Email",
      "Phone",
      "Gender",
      "DOB",
      "College",
      "Degree",
      "Specialization",
      "KYC Status",
      "Account Status",
    ];

    const rows = students.map((s, i) => [
      i + 1,
      s.studentName,
      s.studentId,
      s.email,
      s.phone,
      s.gender,
      s.dob,
      s.collegeName,
      s.degree,
      s.specialization,
      s.kycStatus ? "Verified" : "Pending",
      s.userStatus,
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
    a.download = `students-report.${format === "csv" ? "csv" : "xls"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // console.log("final data", students);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Students</h1>

      <CommonTable<Student>
        rowKey="studentId"
        columns={columns}
        data={students}
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

      <StudentView
        studentId={selectedStudentId}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
    </div>
  );
};

export default StudentList;
