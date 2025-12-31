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
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CommonPagination from "../../Common/CommonPagination";
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

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  data: DegreeData[];
}

const DegreeSpecializationList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState<DegreeData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<DegreeData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const fetchDegreeSpecialization = async (): Promise<PaginatedResponse> => {
    try {
      const searchParam = searchValue ? `&search=${searchValue}` : "";
      const response = await fetch(
        `${API_URL}/api/degree?page=${currentPage}&limit=${pageSize}${searchParam}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Fetch error:", error);
      return { total: 0, page: 1, limit: 10, data: [] };
    }
  };

  const { data: fetchedDegreeSpecialization, isFetching } = useQuery<
    PaginatedResponse,
    Error
  >({
    queryKey: ["degreeSpecialization", currentPage, pageSize, searchValue],
    queryFn: fetchDegreeSpecialization,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
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
          showDelete={false}
        />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const filterOptions = [
    {
      label: "Status",
      key: "status",
      options: ["active", "inactive"],
    },
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!degreeData || degreeData.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "Degree Name",
      "Level",
      "Specializations",
      "Status",
      "Created on",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    degreeData.forEach((row, index) => {
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${row.name || "N/A"}"`,
        `"${row.graduation_level || "N/A"}"`,
        `"${row.specialization || "N/A"}"`,
        `"${row.status || "N/A"}"`,
        `"${row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}"`,
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
    a.download = `degree-specialization-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  // Extract data and total from the paginated response
  const degreeData = fetchedDegreeSpecialization?.data || [];
  const total = fetchedDegreeSpecialization?.total || 0;

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
          <DownloadFilterButton
            onSearch={handleSearch}
            searchValue={searchValue}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onDownload={handleDownload}
          />

          <Table
            columns={columns}
            dataSource={degreeData}
            scroll={{ x: "max-content" }}
            rowKey="id"
            loading={isFetching}
            pagination={false}
            className="shadow-sm rounded-lg"
          />
          <CommonPagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default DegreeSpecializationList;
