import {
  DownloadOutlined,
  FilterOutlined,
  LeftOutlined,
  MoreOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Dropdown, Input } from "antd";
import React, { useState } from "react";
import Loader from "../../Common/Loader";
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

const fetchStudents = async (): Promise<Student[]> => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const response = await fetch(`${API_URL}/api/student/student/list`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.data;
};

const StudentList: React.FC = () => {
  const {
    data: students = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        {/* <Button type="primary" className="bg-button-primary">
          + Add New Students
        </Button> */}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search"
            className="w-full"
          />
        </div>
        <div className="flex gap-4">
          <Button icon={<DownloadOutlined />}>Download Report</Button>
          <Button icon={<FilterOutlined />}>Filter by</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader size="large" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[400px] text-red-500">
          Error fetching students
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-sm rounded-lg">
            <table className="w-full min-w-[2000px] border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "100px" }}
                  >
                    S No
                  </th> */}
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "280px" }}
                  >
                    Student Name
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "200px" }}
                  >
                    Student ID
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "220px" }}
                  >
                    Email Address
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "180px" }}
                  >
                    Phone Number
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "120px" }}
                  >
                    Gender
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "170px" }}
                  >
                    DOB
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "200px" }}
                  >
                    Address
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "220px" }}
                  >
                    College
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "200px" }}
                  >
                    Degree
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "180px" }}
                  >
                    Specialisation
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "120px" }}
                  >
                    Start Year
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "120px" }}
                  >
                    End Year
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "150px" }}
                  >
                    KYC Status
                  </th>
                  {/* <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "180px" }}
                  >
                    Registration Date
                  </th> */}
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "150px" }}
                  >
                    Account Status
                  </th>
                  <th
                    className="p-3 text-left text-sm font-medium text-gray-500"
                    style={{ width: "100px" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center p-4 rounded-full bg-button-primary text-white">
                          <Avatar className="bg-button-primary text-white">
                            {student.studentName.charAt(0)}
                          </Avatar>
                        </div>
                        <span className="text-sm">{student.studentName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{student.studentId}</td>
                    <td className="p-3 text-sm">{student.email}</td>
                    <td className="p-3 text-sm">{student.phone}</td>
                    <td className="p-3">
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          student.gender.toLowerCase() === "male"
                            ? "text-green-600 bg-green-50"
                            : "text-orange-600 bg-orange-50"
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-blue-600">{student.dob}</td>
                    <td
                      className="p-3 text-sm max-w-[350px] truncate"
                      title={student.address}
                    >
                      {student.address}
                    </td>
                    <td className="p-3 text-sm">
                      {student.collegeName || "NA"}
                    </td>
                    <td className="p-3 text-sm">{student.degree || "NA"}</td>
                    <td className="p-3 text-sm">
                      {student.specialization || "NA"}
                    </td>
                    <td className="p-3 text-sm text-blue-600">
                      {student.startYear || "NA"}
                    </td>
                    <td className="p-3 text-sm text-orange-500">
                      {student.endYear || "NA"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          student.kycStatus === true
                            ? " text-green-600 bg-green-50"
                            : " text-orange-300 bg-orange-50"
                        }`}
                      >
                        {student.kycStatus ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          student.userStatus.toLowerCase() === "active"
                            ? "text-green-600 bg-green-50"
                            : "text-red-600 bg-red-50"
                        }`}
                      >
                        {student.userStatus}
                      </span>
                    </td>

                    <td className="p-3">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "1",
                              label: "View",
                              onClick: () => {
                                setSelectedStudentId(student.studentId);
                                setIsOpen(true);
                              },
                            },
                            {
                              key: "2",
                              label: "Edit",
                            },
                            {
                              key: "3",
                              label: "Delete",
                            },
                          ],
                        }}
                        trigger={["click"]}
                      >
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <span>Item per page</span>
              <select className="border rounded p-1">
                <option>1</option>
                <option>5</option>
                <option>10</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button icon={<LeftOutlined />}>Previous</Button>
              <div className="flex gap-2">
                <Button type="primary" className="bg-button-primary">
                  1
                </Button>
                <Button>2</Button>
                <span>...</span>
                <Button>3</Button>
              </div>
              <Button icon={<RightOutlined />}>Next</Button>
            </div>
          </div>
        </>
      )}

      <StudentView
        studentId={selectedStudentId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default StudentList;
