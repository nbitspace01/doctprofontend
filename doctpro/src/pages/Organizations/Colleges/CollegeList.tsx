import {
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Dropdown, Input, Menu, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";

interface CollegeData {
  key: string;
  sNo: number;
  logo: string;
  collegeName: string;
  location: string;
  associatedHospital: string;
  createdOn: string;
  status: "Active" | "Pending" | "Unactive";
}

interface CollegeResponse {
  data: CollegeData[];
  total: number;
}

const CollegeList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchColleges = async () => {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/college/`);
    if (!response.ok) {
      throw new Error("Failed to fetch colleges");
    }
    setLoading(false);
    return response.json();
  };

  const { data: fetchedColleges } = useQuery<CollegeResponse, Error>({
    queryKey: ["Colleges"],
    queryFn: fetchColleges,
  });

  const columns: ColumnsType<CollegeData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 70,
    },
    {
      title: "College Name",
      dataIndex: "collegeName",
      key: "collegeName",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.logo ? (
            <img
              src={record.logo}
              alt={text}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Avatar className="bg-button-primary" size={40}>
              {text.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Associated Hospital",
      dataIndex: "associatedHospital",
      key: "associatedHospital",
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          className={`px-3 py-1 rounded-full ${
            status === "Active"
              ? "bg-green-50 text-green-600"
              : status === "Pending"
              ? "bg-yellow-50 text-yellow-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Dropdown
          overlay={
            <Menu
              items={[
                {
                  key: "1",
                  label: "Edit",
                },
                { key: "2", label: "Delete" },
                {
                  key: "3",
                  label: "View Details",
                },
              ]}
            />
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Transform the fetched data to match the required format
  const transformedData =
    fetchedColleges?.data?.map((college: any, index: number) => ({
      key: index.toString(),
      sNo: index + 1,
      logo: college.logo ?? null,
      collegeName: college.name ?? "N/A",
      location: college.city ?? "N/A",
      associatedHospital: college.associatedHospital ?? "N/A",
      createdOn:
        new Date(college.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) ?? "N/A",
      status: college.status ?? "Pending",
    })) ?? [];

  // Use transformed data or empty array
  const tableData = transformedData.length > 0 ? transformedData : [];

  const handleAddCollegeClick = () => {
    setIsModalVisible(true);
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader size="large" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Colleges</h1>
            <Button
              type="primary"
              className="bg-button-primary hover:!bg-button-primary"
              onClick={handleAddCollegeClick}
            >
              <Plus /> Add New Colleges
            </Button>
          </div>

          <AddCollegeModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          />

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search"
                className="max-w-xs"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="flex gap-4">
                <Button
                  icon={<DownloadOutlined />}
                  className="flex items-center"
                >
                  Download Report
                </Button>
                <Button icon={<FilterOutlined />} className="flex items-center">
                  Filter by
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{
                total: fetchedColleges?.total ?? 0,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              className=" rounded-lg"
              locale={{
                emptyText: "No colleges available",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CollegeList;
