import { PlusOutlined } from "@ant-design/icons";
import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import DegreeAddModal from "./DegreeAddModal";
import DegreeView from "./DegreeView";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import Loader from "../../Common/Loader";
import FormattedDate from "../../Common/FormattedDate";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const DegreeSpecializationList: React.FC = () => {
  const queryClient = useQueryClient();
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
  const { data: fetchedDegreeSpecialization, isFetching } = useQuery<
    DegreeData[],
    Error
  >({
    queryKey: ["degreeSpecialization"],
    queryFn: fetchDegreeSpecialization,
  });
  if (isFetching) {
    return <Loader size="large" />;
  }

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
      render: (date) => <FormattedDate dateString={date} format="long" />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <CommonDropdown
          onView={() => handleView(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => {}}
        />
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

        <div className="bg-white rounded-lg shadow w-full">
          <SearchFilterDownloadButton />

          <Table
            columns={columns}
            dataSource={fetchedDegreeSpecialization}
            scroll={{ x: "max-content" }}
            rowKey="id"
            pagination={{
              total: fetchedDegreeSpecialization?.length ?? 0,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            className="shadow-sm rounded-lg"
          />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default DegreeSpecializationList;
