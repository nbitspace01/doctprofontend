import React, { useState } from "react";
import { Table, Button, Input, Tag, Dropdown, Space } from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import DegreeAddModal from "./DegreeAddModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import DegreeView from "./DegreeView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const queryClient = new QueryClient();

const DegreeSpecializationList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState<DegreeData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<DegreeData | null>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const fetchDegreeSpecialization = async () => {
    try {
      const response = await fetch(`${API_URL}/api/degree`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  };
  const { data: fetchedDegreeSpecialization, isLoading } = useQuery<
    DegreeData[],
    Error
  >({
    queryKey: ["degreeSpecialization"],
    queryFn: fetchDegreeSpecialization,
  });

  const handleEdit = (record: DegreeData) => {
    // Ensure we're creating a clean copy of the record with all required fields
    const editData = {
      id: record.id,
      name: record.name,
      graduation_level: record.graduation_level,
      specialization: record.specialization,
      status: record.status,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };

    console.log("Edit Data being set:", editData); // Debug log
    setEditingDegree(editData);
    setIsModalOpen(true);
  };

  const handleView = (record: DegreeData) => {
    setSelectedDegree(record);
    setIsViewDrawerOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      let response;

      if (editingDegree) {
        console.log("Editing degree with PUT request"); // Debug log
        response = await fetch(`${API_URL}/api/degree/${editingDegree.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        response = await fetch(`${API_URL}/api/degree`, {
          method: "POST", // Using POST for new records
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsModalOpen(false);
      setEditingDegree(null);
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ["degreeSpecialization"] });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const columns: ColumnsType<DegreeData> = [
    {
      title: "S No",
      render: (_, __, index) => index + 1,
      width: "70px",
    },
    {
      title: "Degree Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Level",
      dataIndex: "graduation_level",
      key: "graduation_level",
      render: (text) => <span className="text-blue-500">{text}</span>,
    },
    {
      title: "Specializations",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "success"
              : status === "inactive"
              ? "error"
              : "warning"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Created on",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "View",
                onClick: () => handleView(record),
              },
              {
                key: "2",
                label: "Edit",
                onClick: () => handleEdit(record),
              },
              { key: "3", label: "Delete" },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Degree & Specialization</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            type="primary"
            icon={<PlusOutlined />}
            className="bg-button-primary hover:!bg-button-primary"
          >
            Add New Degree & Specialization
          </Button>
        </div>

        <div>
          <DegreeAddModal
            key={editingDegree?.id ?? ""}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingDegree(null);
            }}
            onSave={handleSave}
            initialValues={editingDegree}
          />
        </div>

        <DegreeView
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          degreeId={selectedDegree?.id ?? ""}
        />

        <div className="flex justify-between items-center mb-6">
          <Input.Search
            placeholder="Search"
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button icon={<DownloadOutlined />}>Download Report</Button>
            <Button icon={<FilterOutlined />}>Filter by</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={fetchedDegreeSpecialization}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: fetchedDegreeSpecialization?.length ?? 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          className="shadow-sm rounded-lg"
        />
      </div>
    </QueryClientProvider>
  );
};

export default DegreeSpecializationList;
