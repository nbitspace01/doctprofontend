import { PlusOutlined } from "@ant-design/icons";
import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { Button, Table, Tag, message } from "antd";
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
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const fetchDegreeSpecialization = async (): Promise<PaginatedResponse> => {
    try {
      const searchParam = searchValue ? `&search=${searchValue}` : "";
      
      // Process filter values
      const processedFilters: Record<string, any> = {};
      const statusFilters: string[] = [];
      
      Object.entries(filterValues).forEach(([key, value]) => {
        // Skip empty values - but be careful with false values for checkboxes
        if (value === "" || value === null || value === undefined) {
          return;
        }
        
        // Handle checkbox-style filters like "status_active"
        if (key.includes("_")) {
          const [filterKey, filterValue] = key.split("_");
          if (value === true && filterKey === "status") {
            statusFilters.push(filterValue);
            console.log(`Added status filter: ${filterValue}`);
          }
        } else {
          // Handle regular text filters (name, graduation_level, specialization)
          const trimmedValue = String(value).trim();
          if (trimmedValue) {
            processedFilters[key] = trimmedValue;
            console.log(`Added text filter: ${key} = ${trimmedValue}`);
          }
        }
      });
      
      // Build filter parameters
      const filterParams: string[] = [];
      
      // Add text filters
      Object.entries(processedFilters).forEach(([key, value]) => {
        filterParams.push(`${key}=${encodeURIComponent(value)}`);
      });
      
      // Add status filter
      if (statusFilters.length > 0) {
        filterParams.push(`status=${encodeURIComponent(statusFilters.join(","))}`);
      }
      
      console.log("Processed filters:", processedFilters);
      console.log("Status filters:", statusFilters);
      console.log("Filter params:", filterParams);
      
      const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
      const fullUrl = `${API_URL}/api/degree?page=${currentPage}&limit=${pageSize}${searchParam}${filterParam}`;
      
      console.log("Degree API URL:", fullUrl);
      console.log("Filter values:", filterValues);

      const response = await fetch(fullUrl);

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
    queryKey: ["degreeSpecialization", currentPage, pageSize, searchValue, filterValues],
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/degree/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degreeSpecialization"] });
      message.success("Degree deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      message.error("Failed to delete degree");
    },
  });

  const handleDelete = (record: DegreeData) => {
    deleteMutation.mutate(record.id);
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
          onDelete={() => handleDelete(record)}
          showDelete={true}
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
      label: "Degree Name",
      key: "name",
    },
    {
      label: "Level",
      key: "graduation_level",
    },
    {
      label: "Specializations",
      key: "specialization",
    },
    {
      label: "Status",
      key: "status",
      options: ["active", "inactive", "pending"],
    },
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    // Clean up empty values from filters
    const cleanedFilters: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      // Only keep non-empty values
      if (value !== "" && value !== null && value !== undefined) {
        // For checkboxes, only keep if true
        if (key.includes("_")) {
          if (value === true) {
            cleanedFilters[key] = value;
          }
        } else {
          // For text inputs, trim and keep if not empty
          const trimmed = String(value).trim();
          if (trimmed) {
            cleanedFilters[key] = trimmed;
          }
        }
      }
    });
    
    console.log("Filter values received:", filters);
    console.log("Cleaned filter values:", cleanedFilters);
    setFilterValues(cleanedFilters);
    setCurrentPage(1);
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
  let degreeData = fetchedDegreeSpecialization?.data || [];
  
  // Apply client-side filtering - always apply to ensure filters work
  const statusFilters: string[] = [];
  const nameFilter = filterValues.name;
  const levelFilter = filterValues.graduation_level;
  const specializationFilter = filterValues.specialization;
  
  // Collect status filters from filterValues
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.includes("_") && value === true) {
      const [filterKey, filterValue] = key.split("_");
      if (filterKey === "status") {
        statusFilters.push(filterValue);
      }
    }
  });
  
  console.log("Client-side filtering - Filter values:", {
    nameFilter,
    levelFilter,
    specializationFilter,
    statusFilters,
    totalDataBeforeFilter: degreeData.length
  });
  
  // Always apply client-side filtering if any filters are set
  if (nameFilter || levelFilter || specializationFilter || statusFilters.length > 0) {
    const beforeFilterCount = degreeData.length;
    degreeData = degreeData.filter((degree: DegreeData) => {
      // Name filter
      const matchesName = !nameFilter || 
        (degree.name && degree.name.toLowerCase().includes(String(nameFilter).toLowerCase().trim()));
      
      // Level filter
      const matchesLevel = !levelFilter || 
        (degree.graduation_level && degree.graduation_level.toLowerCase().includes(String(levelFilter).toLowerCase().trim()));
      
      // Specialization filter - ensure it works correctly with proper null checks
      const matchesSpecialization = !specializationFilter || (() => {
        if (!degree.specialization) return false;
        const specValue = String(degree.specialization).toLowerCase().trim();
        const filterValue = String(specializationFilter).toLowerCase().trim();
        return specValue.includes(filterValue);
      })();
      
      // Status filter - always apply client-side for reliability
      const matchesStatus = statusFilters.length === 0 || (() => {
        const degreeStatus = String(degree.status || "").trim();
        return statusFilters.some(status => {
          const statusLower = String(status).toLowerCase().trim();
          const degreeStatusLower = degreeStatus.toLowerCase();
          // Match case-insensitively
          const matches = statusLower === degreeStatusLower;
          return matches;
        });
      })();
      
      const allMatch = matchesName && matchesLevel && matchesSpecialization && matchesStatus;
      
      // Debug log for first few items
      if (degreeData.indexOf(degree) < 3) {
        console.log(`Filter check for "${degree.name}":`, {
          matchesName,
          matchesLevel,
          matchesSpecialization: { 
            filter: specializationFilter, 
            value: degree.specialization, 
            matches: matchesSpecialization 
          },
          matchesStatus: {
            filter: statusFilters,
            value: degree.status,
            matches: statusFilters.length === 0 || statusFilters.some(s => s.toLowerCase() === degree.status?.toLowerCase())
          },
          allMatch
        });
      }
      
      return allMatch;
    });
    
    console.log(`Client-side filtering: ${beforeFilterCount} -> ${degreeData.length} items`);
  }
  
  const hasClientSideFilters = nameFilter || levelFilter || specializationFilter || statusFilters.length > 0;
  const total = hasClientSideFilters ? degreeData.length : (fetchedDegreeSpecialization?.total || 0);

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
