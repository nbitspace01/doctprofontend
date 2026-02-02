import { App, Avatar } from "antd";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import FormattedDate from "../../Common/FormattedDate";
import StudentView from "./StudentView";

import { useListController } from "../../../hooks/useListController";
import CommonTable from "../../../components/Common/CommonTable";
import { deleteStudentApi, fetchStudentsApi } from "../../../api/student.api";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import StatusBadge from "../../Common/StatusBadge";

interface StudentData {
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
  kycStatus: string;
  status: string;
}

interface StudentResponse {
  data: StudentData[];
  total: number;
}

const StudentList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editData, setEditData] = useState<StudentData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedStudent, setselectedStudent] = useState<StudentData | null>(
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
  const { data: studentResponse, isFetching } = useQuery<
    StudentResponse,
    Error
  >({
    queryKey: ["students", currentPage, pageSize, searchValue, filterValues],
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
  const allStudents = studentResponse?.data ?? [];
  const totalCount = studentResponse?.total ?? 0;

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      message.success("Student deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete student");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: StudentData) => {
    setselectedStudent(record);
    setIsViewDrawerOpen(true);
  };

  // const handleEdit = (record: StudentData) => {
  //   setEditData(record);
  //   setIsModalOpen(true);
  // };

  const handleDelete = (record: StudentData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.studentName}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.studentId),
    });
  };

  /* -------------------- Columns -------------------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        width: 70,
        render: (_: unknown, __: StudentData, index: number) =>
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
        render: (status: string) => (
          <StatusBadge status={status} />
        ),
      },
      {
        title: "Account Status",
        dataIndex: "status",
        width: 150,
        render: (status: string) => (
         <StatusBadge
            status={status} />
         
        ),
      },
      {
        title: "Actions",
        width: 100,
        render: (_: any, record: StudentData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            // onEdit={() => handleEdit(record)}
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
      { label: "Student Name", key: "studentName", type: "text" as const },
      { label: "Email", key: "email", type: "text" as const },
      { label: "Phone", key: "phone", type: "text" as const },
      { label: "College", key: "college", type: "text" as const },
      { label: "Degree", key: "degree", type: "text" as const },
      { label: "Specialization", key: "specialization", type: "text" as const },
      {
        label: "Gender",
        key: "gender",
        type: "checkbox" as const,
        options: ["MALE", "FEMALE"],
      },
      {
        label: "KYC Status",
        key: "kycStatus",
        type: "checkbox" as const,
        options: ["APPROVED", "REJECTED", "PENDING"],
      },
      {
        label: "Account Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "INACTIVE", "PENDING"],
      },
    ],
    [],
  );

  const handleDownload = (format: "excel" | "csv") => {
    if (!allStudents.length) return;

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

    const rows = allStudents.map((s, i) => [
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
      s.kycStatus,
      s.status,
    ]);

    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");

    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
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
    <div className="px-6">
      <h1 className="text-2xl font-bold pb-4">Students</h1>

      <CommonTable<StudentData>
        rowKey="studentId"
        columns={columns}
        data={allStudents}
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

      {selectedStudent && (
        <StudentView
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          studentData={selectedStudent}
        />
      )}
    </div>
  );
};

export default StudentList;
