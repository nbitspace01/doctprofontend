import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Table, Tag } from "antd";
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
  const fetchColleges = async () => {
    setLoading(true);
    const validPage = currentPage || 1;
    const validLimit = pageSize || 10;
    const searchParam = searchValue ? `&search=${searchValue}` : "";
    const response = await fetch(
      `${API_URL}/api/college?page=${validPage}&limit=${validLimit}${searchParam}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch colleges");
    }
    setLoading(false);
    return response.json();
  };

  const { data: fetchedColleges } = useQuery<CollegeResponse, Error>({
    queryKey: ["Colleges", currentPage, pageSize, searchValue],
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
          onDelete={() => {}}
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

  // Use transformed data or empty array
  const tableData = transformedData.length > 0 ? transformedData : [];

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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const filterOptions = [
    {
      label: "Status",
      key: "status",
      options: ["Active", "Pending", "Unactive"],
    },
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
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
              total={fetchedColleges?.total ?? 0}
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
