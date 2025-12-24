import React, { useState } from "react";
import { Table, Button, Tag, Modal, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import CreateJobPost from "./CreateJobPost";
import JobPostViewDrawer from "./JobPostViewDrawer";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";

interface JobPost {
  key: string;
  sNo: number;
  jobTitle: string;
  expRequired: string;
  location: string;
  specialization: string;
  employmentType: string;
  noOfApplications: number;
  status: string;
  id?: string;
}

const JobPostList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const filterOptions = [
    {
      label: "Job Title",
      key: "jobTitle",
    },
    {
      label: "Location",
      key: "location",
    },
    {
      label: "Status",
      key: "status",
      options: ["Active", "Expired", "Expiring Soon", "Pending"],
    },
    {
      label: "Employment Type",
      key: "employmentType",
      options: ["Full Time", "Part Time", "Contract"],
    },
  ];

  // Mock data - replace with actual API call
  const mockData: JobPost[] = [
    {
      key: "1",
      sNo: 1,
      jobTitle: "Senior Consultant",
      expRequired: "5-8 Yrs",
      location: "Chennai",
      specialization: "BDS-Dental Tec..",
      employmentType: "Full Time",
      noOfApplications: 3350,
      status: "Active",
      id: "1",
    },
    {
      key: "2",
      sNo: 2,
      jobTitle: "Physiotherapist",
      expRequired: "5-8 Yrs",
      location: "Chennai",
      specialization: "Bachelor of Physi.",
      employmentType: "Part Time",
      noOfApplications: 3350,
      status: "Expiring Soon",
      id: "2",
    },
    {
      key: "3",
      sNo: 3,
      jobTitle: "Jr Consultant Dentist",
      expRequired: "3-5 Yrs",
      location: "Chennai",
      specialization: "BDS-Dental Tec..",
      employmentType: "Part Time",
      noOfApplications: 3350,
      status: "Expired",
      id: "3",
    },
    {
      key: "4",
      sNo: 4,
      jobTitle: "Physiotherapist",
      expRequired: "5-8 Yrs",
      location: "Chennai",
      specialization: "Bachelor of Physi.",
      employmentType: "Full Time",
      noOfApplications: 3250,
      status: "Pending",
      id: "4",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "green";
      case "Expired":
        return "red";
      case "Expiring Soon":
        return "orange";
      case "Permanent":
        return "blue";
      case "Inactive":
        return "purple";
      case "Pending":
        return "orange";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<JobPost> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
      width: 80,
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Exp Required",
      dataIndex: "expRequired",
      key: "expRequired",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Employment Type",
      dataIndex: "employmentType",
      key: "employmentType",
    },
    {
      title: "No of Applications Received",
      dataIndex: "noOfApplications",
      key: "noOfApplications",
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: JobPost) => (
        <CommonDropdown
          onView={() => {
            setSelectedJobId(record.id || "");
            setIsViewDrawerOpen(true);
          }}
          onEdit={() => {
            setEditingJob(record);
            setIsCreateModalOpen(true);
          }}
          onDelete={() => {
            Modal.confirm({
              title: "Delete Job Post",
              content: "Are you sure you want to delete this job post?",
              okText: "Delete",
              okType: "danger",
              onOk: () => {
                // Handle delete logic here
                queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
              },
            });
          }}
        />
      ),
    },
  ];

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingJob(null);
    queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!mockData || mockData.length === 0) {
      console.log("No data to download");
      return;
    }

    // Define headers
    const headers = ["S No", "Job Title", "Exp Required", "Location", "Specialization", "Employment Type", "No of Applications", "Status"];
    
    // Create rows
    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    mockData.forEach((row, index) => {
      const values = [
        index + 1,
        `"${row.jobTitle || "N/A"}"`,
        `"${row.expRequired || "N/A"}"`,
        `"${row.location || "N/A"}"`,
        `"${row.specialization || "N/A"}"`,
        `"${row.employmentType || "N/A"}"`,
        row.noOfApplications || 0,
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
    a.download = `job-posts-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Job post Management</h1>
        <Button
          type="primary"
          className="bg-button-primary hover:!bg-button-primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Post A New Job
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          onDownload={handleDownload}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />
        <Table
          columns={columns}
          dataSource={mockData}
          scroll={{ x: "max-content" }}
          pagination={false}
          rowKey="id"
        />
        <div className="flex justify-end my-2 py-3">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={mockData.length}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      </div>

      <CreateJobPost open={isCreateModalOpen} onClose={handleModalClose} editingJob={editingJob} />
      <JobPostViewDrawer
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        jobPostId={selectedJobId}
      />
    </div>
  );
};

export default JobPostList;
