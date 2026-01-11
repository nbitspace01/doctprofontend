import React, { useState } from "react";
import { Table, Button, Tag, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import CreateJobPost from "./CreateJobPost";
import JobPostViewDrawer from "./JobPostViewDrawer";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import CommonPagination from "../Common/CommonPagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import api from "../Common/axiosInstance";
import Loader from "../Common/Loader";

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

  const fetchJobs = async () => {
    const res = await api.get(`/api/job/jobs`);
    const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    return data;
  };

  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
  } = useQuery({
    queryKey: ["jobPosts", currentPage, pageSize, searchValue, filterValues],
    queryFn: fetchJobs,
  });

  const jobsList: JobPost[] = (jobsData || []).map((job: any, index: number) => ({
    key: job.id || job._id || index.toString(),
    sNo: index + 1,
    jobTitle: job.jobTitle || job.title || "-",
    expRequired: job.expRequired || job.experienceRequired || "-",
    location: job.location || "-",
    specialization: job.specialization || "-",
    employmentType: job.employmentType || job.employment_type || "-",
    noOfApplications: job.noOfApplications || job.no_of_applications || job.applicationsCount || 0,
    status: job.status || "Pending",
    id: job.id || job._id || index.toString(),
  }));

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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!jobsList || jobsList.length === 0) {
      console.log("No data to download");
      return;
    }

    // Define headers
    const headers = ["S No", "Job Title", "Exp Required", "Location", "Specialization", "Employment Type", "No of Applications", "Status"];
    
    // Create rows
    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    jobsList.forEach((row, index) => {
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

  if (jobsLoading) {
    return <Loader size="large" />;
  }

  if (jobsError) {
    return <div className="p-6">Error loading job posts</div>;
  }

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
          filterOption={filterOptions}
          onFilterChange={handleFilterChange}
        />
        <Table
          columns={columns}
          dataSource={jobsList}
          scroll={{ x: "max-content" }}
          pagination={false}
          rowKey="id"
        />
        <CommonPagination
          current={currentPage}
          pageSize={pageSize}
          total={jobsList.length}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
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
