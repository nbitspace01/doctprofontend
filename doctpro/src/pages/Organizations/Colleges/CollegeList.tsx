import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";
import EditCollegeModal from "./EditCollegeModal";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CommonPagination from "../../Common/CommonPagination";
import CollegeViewDrawer from "./CollegeViewDrawer";

interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string;
  collegeName: string;
  location: string;
  associatedHospital: any[];
  hospitals: any[];
  createdOn: string;
  status: "Active" | "Pending" | "Unactive";
}

interface CollegeResponse {
  data: CollegeData[];
  total: number;
}

const CollegeList: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const fetchColleges = async () => {
    setLoading(true);
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const searchParam = searchValue ? `&search=${searchValue}` : "";
    
    // Process filter values
    const processedFilters: Record<string, any> = {};
    const statusFilters: string[] = [];
    
    Object.entries(filterValues).forEach(([key, value]) => {
      // Skip empty values
      if (!value || value === "" || value === null || value === undefined) {
        return;
      }
      
      if (key.includes("_")) {
        // Handle checkbox-style filters like "status_Active"
        const [filterKey, filterValue] = key.split("_");
        if (value === true && filterKey === "status") {
          statusFilters.push(filterValue);
        }
      } else {
        // Handle regular text filters (name, location, associatedHospital)
        const trimmedValue = String(value).trim();
        if (trimmedValue) {
          processedFilters[key] = trimmedValue;
        }
      }
    });
    
    // Build filter parameters
    const filterParams: string[] = [];
    
    // Add text filters
    Object.entries(processedFilters).forEach(([key, value]) => {
      filterParams.push(`${key}=${encodeURIComponent(value)}`);
    });
    
    // Don't send status filter to API - we'll filter client-side instead
    // This ensures we get all data and can filter it properly
    // if (statusFilters.length > 0) {
    //   filterParams.push(`status=${encodeURIComponent(statusFilters.join(","))}`);
    // }
    
    const filterParam = filterParams.length > 0 ? `&${filterParams.join("&")}` : "";
    const fullUrl = `${API_URL}/api/college?page=${validPage}&limit=${validLimit}${searchParam}${filterParam}`;
    
    console.log("College API URL:", fullUrl);
    console.log("College API - Filter values:", filterValues);
    console.log("College API - Status filters (will filter client-side):", statusFilters);
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch colleges");
    }
    setLoading(false);
    const data = await response.json();
    console.log("College API Response - Total:", data?.total, "Data count:", data?.data?.length);
    if (data?.data?.length > 0) {
      console.log("College API Response - Sample statuses:", data.data.slice(0, 3).map((c: any) => c.status));
    }
    return data;
  };

  const { data: fetchedColleges } = useQuery<CollegeResponse, Error>({
    queryKey: ["Colleges", currentPage, pageSize, searchValue, filterValues],
    queryFn: fetchColleges,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
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
      width: 400,
      render: (associatedHospital: any, record: any) => (
        console.log(associatedHospital),
        (
          <div className="flex items-start gap-3">
            <span className="text-sm break-words whitespace-normal">
              {record.hospitals && record.hospitals.length > 0
                ? record.hospitals
                    .map((hospital: any) => hospital.name)
                    .join(", ")
                : "No hospitals associated"}
            </span>
          </div>
        )
      ),
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
      render: (_: any, record: CollegeData) => (
        <CommonDropdown
          onView={() => {
            setSelectedCollegeId(record.id);
            setIsOpen(true);
          }}
          onEdit={() => {
            setSelectedCollegeId(record.id);
            setIsEditModalVisible(true);
          }}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const transformedData =
    fetchedColleges?.data?.map((college: any, index: number) => ({
      key: college._id || college.id,
      id: college._id || college.id, // Store the actual college ID
      sNo: (currentPage - 1) * pageSize + index + 1,
      logo: college.logo ?? null,
      collegeName: college.name ?? "N/A",
      location: college.city ?? "N/A",
      associatedHospital: college.associatedHospital ?? "N/A",
      hospitals: college.hospitals || [], // Include hospitals data
      createdOn:
        new Date(college.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) ?? "N/A",
      status: college.status ?? "Pending",
    })) ?? [];
  
  console.log("College transform - Raw API data count:", fetchedColleges?.data?.length);
  console.log("College transform - Transformed data count:", transformedData.length);
  if (transformedData.length > 0) {
    console.log("College transform - Sample statuses in transformed data:", transformedData.slice(0, 3).map(c => c.status));
  }

  // Apply client-side filtering if needed
  let filteredTableData = transformedData;
  const statusFilters: string[] = [];
  const nameFilter = filterValues.name;
  const locationFilter = filterValues.location;
  const associatedHospitalFilter = filterValues.associatedHospital;
  
  // Collect status filters from filterValues
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.includes("_") && value === true) {
      const [filterKey, filterValue] = key.split("_");
      if (filterKey === "status") {
        statusFilters.push(filterValue);
        console.log(`College filter - Added status: ${filterValue}`);
      }
    }
  });
  
  console.log(`College filter - Total status filters: ${statusFilters.length}`, statusFilters);
  
  console.log("College filter - Status filters collected:", statusFilters);
  console.log("College filter - Filter values:", filterValues);
  console.log("College filter - Total data before filter:", transformedData.length);
  
  console.log("College filter - Status filters:", statusFilters);
  console.log("College filter - Filter values:", filterValues);
  console.log("College filter - Data count before filter:", transformedData.length);
  
  // Always apply client-side filtering for status to ensure it works
  // Apply all filters
  if (nameFilter || locationFilter || associatedHospitalFilter || statusFilters.length > 0) {
    filteredTableData = transformedData.filter((college: CollegeData) => {
      // Name filter
      const matchesName = !nameFilter || 
        (college.collegeName && college.collegeName.toLowerCase().includes(String(nameFilter).toLowerCase().trim()));
      
      // Location filter
      const matchesLocation = !locationFilter || 
        (college.location && college.location.toLowerCase().includes(String(locationFilter).toLowerCase().trim()));
      
      // Associated Hospital filter
      const matchesHospital = !associatedHospitalFilter || 
        (college.hospitals && college.hospitals.some((h: any) => 
          h.name && h.name.toLowerCase().includes(String(associatedHospitalFilter).toLowerCase().trim())
        )) || false;
      
      // Status filter - always apply client-side for reliability
      const matchesStatus = statusFilters.length === 0 || (() => {
        const collegeStatus = String(college.status || "").trim();
        if (!collegeStatus) return false;
        
        const collegeStatusLower = collegeStatus.toLowerCase();
        const matches = statusFilters.some(status => {
          const statusLower = String(status).toLowerCase().trim();
          // Match case-insensitively
          const result = statusLower === collegeStatusLower;
          return result;
        });
        
        // Debug for troubleshooting
        if (transformedData.indexOf(college) < 2 && statusFilters.length > 0) {
          console.log(`College status filter: "${collegeStatus}" (${collegeStatusLower}) vs filters [${statusFilters.map(s => s.toLowerCase()).join(", ")}] = ${matches}`);
        }
        
        return matches;
      })();
      
      return matchesName && matchesLocation && matchesHospital && matchesStatus;
    });
    
    console.log("College filter - Total data after filter:", filteredTableData.length);
  }

  // Use filtered data or empty array
  const tableData = filteredTableData.length > 0 ? filteredTableData : [];
  
  // Calculate total for pagination - use filtered count if client-side filtering is applied
  const hasClientSideFilters = nameFilter || locationFilter || associatedHospitalFilter || statusFilters.length > 0;
  const displayTotal = hasClientSideFilters ? filteredTableData.length : (fetchedColleges?.total ?? 0);

  const handleAddCollegeClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // queryClient.invalidateQueries({ queryKey: ["Colleges"] });
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedCollegeId(null);
    queryClient.invalidateQueries({ queryKey: ["Colleges"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/college/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["Colleges"] });
      message.success("College deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      message.error("Failed to delete college");
    },
  });

  const handleDelete = (record: CollegeData) => {
    deleteMutation.mutate(record.id);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const filterOptions = [
    {
      label: "College Name",
      key: "name",
    },
    {
      label: "Location",
      key: "location",
    },
    {
      label: "Associated Hospital",
      key: "associatedHospital",
    },
    {
      label: "Status",
      key: "status",
      options: ["Active", "Pending", "Unactive"],
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
    if (!tableData || tableData.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "College Name",
      "Location",
      "Associated Hospital",
      "Created On",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    tableData.forEach((row) => {
      const values = [
        row.sNo,
        `"${row.collegeName || "N/A"}"`,
        `"${row.location || "N/A"}"`,
        `"${row.hospitals?.map((h: any) => h.name).join(", ") || "N/A"}"`,
        `"${row.createdOn || "N/A"}"`,
        `"${row.status || "N/A"}"`,
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
    a.download = `colleges-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
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

      <AddCollegeModal visible={isModalVisible} onClose={handleModalClose} />

      <EditCollegeModal
        visible={isEditModalVisible}
        onClose={handleEditModalClose}
        collegeId={selectedCollegeId}
      />

      <div className="bg-white rounded-lg shadow-sm w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={tableData}
              scroll={{ x: "max-content" }}
              pagination={false}
              className=" rounded-lg"
              locale={{
                emptyText: "No colleges available",
              }}
            />
            <CommonPagination
              current={currentPage}
              pageSize={pageSize}
              total={displayTotal}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
            />
          </>
        )}
      </div>
      <CollegeViewDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        setOpen={setIsOpen}
        collegeId={selectedCollegeId ?? ""}
      />
    </div>
  );
};

export default CollegeList;
