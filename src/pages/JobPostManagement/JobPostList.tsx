import React, { useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import CreateJobPost from "./CreateJobPost";
import JobPostViewDrawer from "./JobPostViewDrawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useListController } from "../../hooks/useListController";
import CommonTable from "../../components/Common/CommonTable";
import { App, Button } from "antd";
import { deleteJobPostApi, fetchJobPostsApi } from "../../api/jobpost.api";
import StatusBadge from "../Common/StatusBadge";

interface JobPostData {
  id: string;
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  status: string;
  noOfApplications?: number;
  valid_from?: string;
  expires_at?: string;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
}

interface JobPostResponse {
  data: JobPostData[];
  total: number;
}

const JobPostList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<JobPostData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPostData | null>(
    null,
  );

  /* -------------------- List Controller -------------------- */
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* -------------------- Query -------------------- */
  const { data: jobPostData, isFetching } = useQuery<JobPostResponse, Error>({
    queryKey: ["jobPosts", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchJobPostsApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allJobPost = jobPostData?.data ?? [];
  const totalCount = jobPostData?.total ?? 0;

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJobPostApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
      message.success("Job post deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete job post");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: JobPostData) => {
    setSelectedJobPost(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: JobPostData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: JobPostData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.title}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  /* -------------------- Columns -------------------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        width: 80,
        render: (_: any, __: JobPostData, index: number) =>
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
        render: (status?: string) => <StatusBadge status={status || ""} />,
      },
      {
        title: "Actions",
        width: 100,
        render: (_: any, record: JobPostData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  /* -------------------- Filters -------------------- */
  const filterOptions = useMemo(
    () => [
      { label: "Job Title", key: "title", type: "text" as const },
      { label: "Location", key: "location", type: "text" as const },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["Active", "Expired", "Expiring Soon", "Pending"],
      },
      {
        label: "Employment Type",
        key: "workType",
        type: "checkbox" as const,
        options: ["Full Time", "Part Time", "Contract"],
      },
    ],
    [],
  );

  const handleDownload = (format: "excel" | "csv") => {
    if (!allJobPost.length) return;
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
    const rows = allJobPost.map((j, i) => [
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
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-button-primary"
        >
          <PlusOutlined /> Post A New Job
        </Button>
      </div>

      <CommonTable<JobPostData>
        rowKey="id"
        columns={columns}
        data={allJobPost}
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
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedJobPost && (
        <JobPostViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          jobPostId={selectedJobPost.id}
        />
      )}
    </div>
  );
};

export default JobPostList;
