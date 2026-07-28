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
  /** The list API returns the resolved college as `college`. */
  college?: string | null;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  isFresher?: boolean;
  currentlyWorking?: boolean;
  experienceOrganizationName?: string | null;
  experienceSpecialization?: string | null;
  experienceLocation?: string | null;
  experienceStartDate?: string | null;
  experienceEndDate?: string | null;
  kycStatus: string;
  status: string;
  category?: string;
}

interface StudentResponse {
  data: StudentData[];
  total: number;
}

interface StudentListProps {
  /**
   * Which registrant group to list. Non-medical users register through the same
   * student flow (user.category = 'NONMEDICAL') but have no college/degree from
   * the medical master lists and never go through KYC, so their table differs.
   */
  category?: "MEDICAL" | "NONMEDICAL";
}

const StudentList: React.FC<StudentListProps> = ({ category = "MEDICAL" }) => {
  const isNonMedical = category === "NONMEDICAL";
  const pageTitle = isNonMedical ? "Non-Medical Users" : "Students";
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
    queryKey: [
      "students",
      category,
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
        category,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // console.log("dta", data);
  const allStudents = studentResponse?.data ?? [];
  const totalCount = studentResponse?.total ?? 0;

  /* -------------------- Mutation -------------------- */
  const recordLabel = isNonMedical ? "user" : "student";

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      message.success(
        `${isNonMedical ? "User" : "Student"} deleted successfully`,
      );
    },
    onError: (error: any) => {
      message.error(error?.message || `Failed to delete ${recordLabel}`);
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
        title: isNonMedical ? "Name" : "Student Name",
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
      { title: isNonMedical ? "User ID" : "Student ID", dataIndex: "studentId", width: 180 },
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
      // Non-medical users have no college from the medical master list; they
      // provide free-text education and a mandatory employment status instead,
      // and they never go through KYC.
      ...(isNonMedical
        ? [
            { title: "Education", dataIndex: "degree", width: 180 },
            { title: "Specialization", dataIndex: "specialization", width: 180 },
            {
              title: "Employment",
              dataIndex: "isFresher",
              width: 150,
              // Not set until the user completes the education step, and
              // undefined must not read as "Experienced".
              render: (isFresher?: boolean | null) =>
                isFresher === null || isFresher === undefined
                  ? "N/A"
                  : isFresher
                    ? "Fresher"
                    : "Experienced",
            },
          ]
        : [
            { title: "College", dataIndex: "college", width: 220 },
            { title: "Degree", dataIndex: "degree", width: 180 },
            { title: "Specialization", dataIndex: "specialization", width: 180 },
            {
              title: "KYC Status",
              dataIndex: "kycStatus",
              width: 150,
              render: (status: string) => <StatusBadge status={status} />,
            },
          ]),
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
    [currentPage, pageSize, isNonMedical],
  );

  /* -------------------- Filters -------------------- */
  const filterOptions = useMemo(
    () => [
      {
        label: isNonMedical ? "Name" : "Student Name",
        key: "studentName",
        type: "text" as const,
      },
      { label: "Email", key: "email", type: "text" as const },
      { label: "Phone", key: "phone", type: "text" as const },
      ...(isNonMedical
        ? [{ label: "Education", key: "degree", type: "text" as const }]
        : [
            { label: "College", key: "college", type: "text" as const },
            { label: "Degree", key: "degree", type: "text" as const },
          ]),
      { label: "Specialization", key: "specialization", type: "text" as const },
      {
        label: "Gender",
        key: "gender",
        type: "checkbox" as const,
        options: ["Male", "Female", "Other"],
      },
      ...(isNonMedical
        ? []
        : [
            {
              label: "KYC Status",
              key: "kycStatus",
              type: "checkbox" as const,
              options: ["APPROVED", "REJECTED", "PENDING"],
            },
          ]),
      {
        label: "Account Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "INACTIVE", "PENDING"],
      },
    ],
    [isNonMedical],
  );

  const handleDownload = async (format: "excel" | "csv") => {
    if (!allStudents.length) return;

    // The table only holds the current page. Export every row matching the
    // active search/filters, falling back to the visible page if that fails.
    let exportRows: StudentData[] = allStudents;
    if (totalCount > allStudents.length) {
      try {
        const fullResponse = await fetchStudentsApi({
          page: 1,
          limit: totalCount,
          searchValue,
          filterValues,
          category,
        });
        exportRows = fullResponse?.data ?? allStudents;
      } catch {
        message.warning("Could not load all records, exporting current page");
      }
    }

    const headers = [
      "S No",
      isNonMedical ? "Name" : "Student Name",
      isNonMedical ? "User ID" : "Student ID",
      "Email",
      "Phone",
      "Gender",
      "DOB",
      ...(isNonMedical
        ? ["Education", "Specialization", "Employment"]
        : ["College", "Degree", "Specialization", "KYC Status"]),
      "Account Status",
    ];

    const rows = exportRows.map((s, i) => [
      i + 1,
      s.studentName,
      s.studentId,
      s.email,
      s.phone,
      s.gender,
      s.dob,
      ...(isNonMedical
        ? [
            s.degree,
            s.specialization,
            s.isFresher === null || s.isFresher === undefined
              ? "N/A"
              : s.isFresher
                ? "Fresher"
                : "Experienced",
          ]
        : [s.college ?? "", s.degree, s.specialization, s.kycStatus]),
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
    a.download = `${isNonMedical ? "non-medical-users" : "students"}-report.${
      format === "csv" ? "csv" : "xls"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // console.log("final data", students);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold pb-4">{pageTitle}</h1>

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
        filterValues={filterValues}
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
          category={category}
        />
      )}
    </div>
  );
};

export default StudentList;
