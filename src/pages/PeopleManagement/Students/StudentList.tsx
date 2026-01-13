import { useQuery } from "@tanstack/react-query";
import { Avatar, Table } from "antd";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import FormattedDate from "../../Common/FormattedDate";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonPagination from "../../Common/CommonPagination";
import StudentView from "./StudentView";

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
  page: number;
  limit: number;
  total: number;
  data: Student[];
}

const fetchStudents = async (
  page: number = 1,
  limit: number = 10000,
  searchValue: string = "",
  filterValues: Record<string, any> = {}
): Promise<PaginatedResponse> => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const searchParam = searchValue ? `&search=${searchValue}` : "";

  // Process filter values to convert checkbox-style filters to proper format
  // Exclude studentName, studentId, and kycStatus from API filters (handle on frontend)
  const processedFilters: Record<string, any> = {};
  Object.entries(filterValues).forEach(([key, value]) => {
    // Skip frontend-only filters
    if (key === "studentName" || key === "studentId" || key === "kycStatus" || key.startsWith("kycStatus_")) {
      return;
    }
    
    if (key.includes("_")) {
      // Handle checkbox-style filters like "gender_Male"
      const [filterKey, filterValue] = key.split("_");
      if (value === true) {
        processedFilters[filterKey] = filterValue.toLowerCase();
      }
    } else {
      // Handle regular text filters
      if (value && String(value).trim()) {
        processedFilters[key] = String(value).trim();
      }
    }
  });

  const filterParam = Object.entries(processedFilters)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const response = await fetch(
    `${API_URL}/api/student/student/list?page=${page}&limit=${limit}${searchParam}${
      filterParam ? `&${filterParam}` : ""
    }`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

const StudentList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const filterOptions = [
    {
      label: "Student Name",
      key: "studentName",
      type: "text" as const,
    },
    {
      label: "Student ID",
      key: "studentId",
      type: "text" as const,
    },
    {
      label: "Email",
      key: "email",
      type: "text" as const,
    },
    {
      label: "Phone",
      key: "phone",
      type: "text" as const,
    },
    {
      label: "Gender",
      key: "gender",
      type: "checkbox" as const,
      options: ["Male", "Female"],
    },
    {
      label: "DOB",
      key: "dob",
      type: "date" as const,
    },
    {
      label: "Address",
      key: "address",
      type: "text" as const,
    },
    {
      label: "College",
      key: "collegeName",
      type: "text" as const,
    },
    {
      label: "Degree",
      key: "degree",
      type: "text" as const,
    },
    {
      label: "Specialization",
      key: "specialization",
      type: "text" as const,
    },
    {
      label: "Start Year",
      key: "startYear",
      type: "text" as const,
    },
    {
      label: "End Year",
      key: "endYear",
      type: "text" as const,
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
  const {
    data: studentsResponse,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "students",
      searchValue,
      filterValues,
    ],
    queryFn: () =>
      fetchStudents(
        1,
        10000,
        searchValue,
        filterValues
      ),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (error) {
    return <div>Error fetching students</div>;
  }

  // Get all students from API
  const allStudents = studentsResponse?.data || [];

  // Extract frontend filter values
  const studentNameFilter = filterValues.studentName;
  const studentIdFilter = filterValues.studentId;
  const kycStatusFilters: string[] = [];
  
  // Collect KYC Status checkbox filter values
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.startsWith("kycStatus_") && value === true) {
      kycStatusFilters.push(key.replace("kycStatus_", ""));
    }
  });

  // Apply client-side filtering for studentName, studentId, and kycStatus
  let filteredStudents = allStudents;
  
  if (studentNameFilter || studentIdFilter || kycStatusFilters.length > 0) {
    filteredStudents = filteredStudents.filter((student: Student) => {
      // Student Name filter
      const matchesStudentName = !studentNameFilter || 
        (student.studentName && student.studentName.toLowerCase().includes(String(studentNameFilter).toLowerCase().trim()));
      
      // Student ID filter
      const matchesStudentId = !studentIdFilter || 
        (student.studentId && student.studentId.toLowerCase().includes(String(studentIdFilter).toLowerCase().trim()));
      
      // KYC Status filter
      const matchesKycStatus = kycStatusFilters.length === 0 || kycStatusFilters.some(filter => {
        if (filter === "Verified") {
          return student.kycStatus === true;
        } else if (filter === "Pending") {
          return student.kycStatus === false;
        }
        return false;
      });
      
      return matchesStudentName && matchesStudentId && matchesKycStatus;
    });
  }

  // Apply pagination to filtered results
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  const students = paginatedStudents;
  const total = filteredStudents.length;

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 280,
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center p-4 rounded-full bg-button-primary text-white">
            <Avatar className="bg-button-primary text-white">
              {text.charAt(0)}
            </Avatar>
          </div>
          <span className="text-sm">{text}</span>
        </div>
      ),
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      width: 200,
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      width: 180,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      render: (gender: string) => (
        <span className="text-sm">
          {gender || "N/A"}
        </span>
      ),
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
      width: 170,
      render: (dob: string) => {
        return <FormattedDate dateString={dob} format="long" />;
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 200,
    },
    {
      title: "College",
      dataIndex: "college",
      key: "college",
      render: (text: string) => (
        <span className="text-sm">{text || "N/A"}</span>
      ),

      width: 220,
    },
    {
      title: "Degree",
      dataIndex: "degree",
      key: "degree",
      render: (text: string) => (
        <span className="text-sm">{text || "N/A"}</span>
      ),
      width: 200,
    },
    {
      title: "Specialisation",
      dataIndex: "specialization",
      key: "specialization",
      render: (text: string) => (
        <span className="text-sm">{text || "N/A"}</span>
      ),
      width: 180,
    },
    {
      title: "Start Year",
      dataIndex: "startYear",
      key: "startYear",
      render: (text: string) => (
        <span className="text-sm">{text || "N/A"}</span>
      ),
      width: 120,
    },
    {
      title: "End Year",
      dataIndex: "endYear",
      key: "endYear",
      render: (text: string) => (
        <span className="text-sm">{text || "N/A"}</span>
      ),
      width: 120,
    },
    {
      title: "KYC Status",
      dataIndex: "kycStatus",
      key: "kycStatus",
      width: 150,
      render: (kycStatus: boolean) => (
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            kycStatus === true
              ? "text-green-600 bg-green-50"
              : "text-orange-300 bg-orange-50"
          }`}
        >
          {kycStatus ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      title: "Account Status",
      dataIndex: "userStatus",
      key: "userStatus",
      width: 150,
      render: (userStatus: string) => (
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            userStatus.toLowerCase() === "active"
              ? "text-green-600 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {userStatus}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: Student) => (
        <CommonDropdown
          onView={() => {
            setSelectedStudentId(record.studentId);
            setIsOpen(true);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          showEdit={false}
          showDelete={false}
        />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
    setFilterValues(filters);
    setPagination({ current: 1, pageSize: pagination.pageSize });
  };

  const handleDownload = (format: "excel" | "csv") => {
    // Get all students and apply frontend filters for download
    const allStudentsForDownload = studentsResponse?.data || [];
    const studentNameFilter = filterValues.studentName;
    const studentIdFilter = filterValues.studentId;
    const kycStatusFilters: string[] = [];
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (key.startsWith("kycStatus_") && value === true) {
        kycStatusFilters.push(key.replace("kycStatus_", ""));
      }
    });

    let studentsToDownload = allStudentsForDownload;
    
    if (studentNameFilter || studentIdFilter || kycStatusFilters.length > 0) {
      studentsToDownload = studentsToDownload.filter((student: Student) => {
        const matchesStudentName = !studentNameFilter || 
          (student.studentName && student.studentName.toLowerCase().includes(String(studentNameFilter).toLowerCase().trim()));
        const matchesStudentId = !studentIdFilter || 
          (student.studentId && student.studentId.toLowerCase().includes(String(studentIdFilter).toLowerCase().trim()));
        const matchesKycStatus = kycStatusFilters.length === 0 || kycStatusFilters.some(filter => {
          if (filter === "Verified") return student.kycStatus === true;
          if (filter === "Pending") return student.kycStatus === false;
          return false;
        });
        return matchesStudentName && matchesStudentId && matchesKycStatus;
      });
    }
    
    if (!studentsToDownload || studentsToDownload.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "Student Name",
      "Student ID",
      "Email Address",
      "Phone Number",
      "Gender",
      "DOB",
      "College",
      "Degree",
      "Specialisation",
      "KYC Status",
      "Account Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    studentsToDownload.forEach((row, index) => {
      const values = [
        index + 1,
        `"${row.studentName || "N/A"}"`,
        `"${row.studentId || "N/A"}"`,
        `"${row.email || "N/A"}"`,
        `"${row.phone || "N/A"}"`,
        `"${row.gender || "N/A"}"`,
        `"${row.dob ? new Date(row.dob).toLocaleDateString() : "N/A"}"`,
        `"${row.collegeName || "N/A"}"`,
        `"${row.degree || "N/A"}"`,
        `"${row.specialization || "N/A"}"`,
        `"${row.kycStatus ? "Verified" : "Pending"}"`,
        `"${row.userStatus || "N/A"}"`,
      ];
      rows.push(values.join(format === "csv" ? "," : "\t"));
    });

    const content = rows.join("\n");
    const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
    const fileExtension = format === "csv" ? "csv" : "xls";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        {/* <Button type="primary" className="bg-button-primary">
          + Add New Students
        </Button> */}
      </div>
      <div className="bg-white  rounded-lg">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
        />

        <Table
          columns={columns}
          dataSource={students}
          rowKey="studentId"
          scroll={{ x: "max-content" }}
          pagination={false}
          loading={isFetching}
        />
        <CommonPagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={total}
          onChange={(page, pageSize) => {
            setPagination({
              current: page,
              pageSize: pageSize || 10,
            });
          }}
          onShowSizeChange={(current, size) => {
            setPagination({
              current: 1,
              pageSize: size,
            });
          }}
        />
      </div>

      <StudentView
        studentId={selectedStudentId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default StudentList;
