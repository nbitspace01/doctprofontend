import { useQuery } from "@tanstack/react-query";
import { Avatar, Table } from "antd";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import FormattedDate from "../../Common/FormattedDate";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
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
  limit: number = 10,
  searchValue: string = "",
  filterValues: Record<string, any> = {}
): Promise<PaginatedResponse> => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const searchParam = searchValue ? `&search=${searchValue}` : "";

  // Process filter values to convert checkbox-style filters to proper format
  const processedFilters: Record<string, any> = {};
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.includes("_")) {
      // Handle checkbox-style filters like "gender_Male"
      const [filterKey, filterValue] = key.split("_");
      if (value === true) {
        processedFilters[filterKey] = filterValue.toLowerCase();
      }
    } else {
      // Handle regular filters
      processedFilters[key] = value;
    }
  });

  const filterParam = Object.entries(processedFilters)
    .map(([key, value]) => `${key}=${value}`)
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
      label: "College",
      key: "collegeName",
      type: "text" as const,
    },
    {
      label: "Gender",
      key: "gender",
      type: "checkbox" as const,
      options: ["Male", "Female"],
    },
  ];
  const {
    data: studentsResponse,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "students",
      pagination.current,
      pagination.pageSize,
      searchValue,
      filterValues,
    ],
    queryFn: () =>
      fetchStudents(
        pagination.current,
        pagination.pageSize,
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

  const students = studentsResponse?.data || [];
  const total = studentsResponse?.total || 0;

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
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            gender.toLowerCase() === "male"
              ? "text-green-600 bg-green-50"
              : "text-orange-600 bg-orange-50"
          }`}
        >
          {gender}
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
        <SearchFilterDownloadButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />

        <Table
          columns={columns}
          dataSource={students}
          rowKey="studentId"
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize || 10,
              });
            },
          }}
          loading={isFetching}
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
