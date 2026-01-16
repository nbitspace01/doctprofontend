import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import CreateJobPost from "./CreateJobPost";
import JobPostViewDrawer from "./JobPostViewDrawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useListController } from "../../hooks/useListController";
import CommonTable from "../../components/Common/CommonTable";
import { App, Button, message, Modal } from "antd";
import { deleteJobPostApi, fetchJobPostsApi } from "../../api/jobpost.api";

export interface JobPost {
  id: string;
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  status: string;
  noOfApplications?: number;
}

const JobPostList: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const queryClient = useQueryClient();

  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();
  const { modal, message } = App.useApp();

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["jobPosts", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchJobPostsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnWindowFocus: false,
  });

  const { mutate: deleteJobPost, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteJobPostApi(id),

    onSuccess: () => {
      message.success("Job post deleted successfully");

      // 🔥 Refetch job post list
      queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
    },

    onError: () => {
      message.error("Failed to delete job post");
    },
  });

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "Delete Job Post?",
      content: "Are you sure you want to delete this job post?",
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk: () => {
        deleteJobPost(id);
      },
    });
  };

  const jobs: JobPost[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "green";
      case "Expired":
        return "red";
      case "Expiring Soon":
      case "Pending":
        return "orange";
      case "Permanent":
        return "blue";
      case "Inactive":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "S No",
      width: 80,
      render: (_: any, __: JobPost, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Job Title", dataIndex: "title", width: 220 },
    { title: "Exp Required", dataIndex: "experience_required", width: 140 },
    { title: "Location", dataIndex: "location", width: 160 },
    { title: "Specialization", dataIndex: "specialization", width: 180 },
    { title: "Employment Type", dataIndex: "workType", width: 140 },
    {
      title: "No of Applications",
      dataIndex: "noOfApplications",
      width: 160,
      render: (v?: number | null) => (v != null ? v.toLocaleString() : "0"),
    },

    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-full bg-${getStatusColor(
            status
          )}-100 text-${getStatusColor(status)}-600`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 100,
      render: (_: any, record: JobPost) => (
        <CommonDropdown
          onView={() => {
            setSelectedJobId(record.id);
            setIsViewDrawerOpen(true);
          }}
          onEdit={() => {
            setEditingJob(record);
            setIsCreateModalOpen(true);
          }}
          onDelete={() => {
            handleDelete(record.id);
            queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
          }}
          showEdit
          showDelete
        />
      ),
    },
  ];

  const filterOptions = [
    { label: "Job Title", key: "jobTitle", type: "text" as const },
    { label: "Location", key: "location", type: "text" as const },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Expired", "Expiring Soon", "Pending"],
    },
    {
      label: "Employment Type",
      key: "employmentType",
      type: "checkbox" as const,
      options: ["Full Time", "Part Time", "Contract"],
    },
  ];

  const handleDownload = (format: "excel" | "csv") => {
    if (!jobs.length) return;
    const headers = [
      "S No",
      "Job Title",
      "Exp Required",
      "Location",
      "Specialization",
      "Employment Type",
      "No of Applications",
      "Status",
    ];
    const rows = jobs.map((j, i) => [
      i + 1,
      j.title,
      j.experience_required,
      j.location,
      j.specialization,
      j.workType,
      j.noOfApplications,
      j.status,
    ]);
    const content = [headers, ...rows]
      .map((r) => r.join(format === "csv" ? "," : "\t"))
      .join("\n");
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `job-posts-${new Date().toISOString().split("T")[0]}.${
      format === "csv" ? "csv" : "xls"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // if (isFetching) return <Loader size="large" />;
  // if (error)
  //   return <div className="p-6 text-red-600">Error loading job posts</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Job Post Management</h1>
        <Button
          type="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          <PlusOutlined /> Post A New Job
        </Button>
      </div>

      <CommonTable<JobPost>
        rowKey="id"
        columns={columns}
        data={jobs}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        filters={filterOptions}
        searchValue={searchValue}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onDownload={handleDownload}
      />

      <CreateJobPost
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingJob={editingJob}
      />
      <JobPostViewDrawer
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        jobPostId={selectedJobId}
      />
    </div>
  );
};

export default JobPostList;
