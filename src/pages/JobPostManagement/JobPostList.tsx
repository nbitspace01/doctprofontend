import React, { useEffect, useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import CreateJobPost from "./CreateJobPost";
import JobPostViewDrawer from "./JobPostViewDrawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useListController } from "../../hooks/useListController";
import CommonTable from "../../components/Common/CommonTable";
import { App, Button } from "antd";
import {
  deleteJobPostApi,
  fetchJobPostsApi,
  fetchOwnJobPostsApi,
} from "../../api/jobpost.api";
import StatusBadge from "../Common/StatusBadge";
import { roleProps, UserRole } from "../../App";
import { JobPostBase, JobPostResponse } from "./jobPostTypes";
import { Plus } from "lucide-react";

const JobPostList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<JobPostBase | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPostBase | null>(
    null,
  );
  const [currentRole, setCurrentRole] = useState<roleProps["role"] | null>(
    (localStorage.getItem("roleName") as roleProps["role"]) || null,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  /* -------------------- Use Effect -------------------- */
  useEffect(() => {
    const storedRole = localStorage.getItem("roleName") as roleProps["role"];
    const storedUserId = localStorage.getItem("userId") || null;
    setCurrentRole(storedRole);
    setCurrentUserId(storedUserId);

    // remove old cached queries
    queryClient.removeQueries({ queryKey: ["jobPosts"] });
  }, []);

  /* -------------------- Query -------------------- */
  const { data: jobPostData, isFetching } = useQuery<JobPostResponse, Error>({
    queryKey: [
      "jobPosts",
      currentRole,
      currentUserId,
      currentPage,
      pageSize,
      searchValue,
      filterValues,
    ],
    queryFn: () => {
      const isAdmin = currentRole === "admin";
      const apiFn =  fetchOwnJobPostsApi;
      return apiFn({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      });
    },
    enabled: !!currentRole && !!currentUserId,
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
  const handleView = (record: JobPostBase) => {
    setSelectedJobPost(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: JobPostBase) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: JobPostBase) => {
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
        render: (_: any, __: JobPostBase, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      { title: "Job Title", dataIndex: "title", width: 220 },
      { title: "Hospital Name", dataIndex: "hospitalName", width: 220 },
      { title: "Exp Required", dataIndex: "experience_required", width: 140 },
      { title: "Location", dataIndex: "location", width: 160 },
      { title: "Specialization", dataIndex: "specialization", width: 180 },
      { title: "Employment Type", dataIndex: "workType", width: 140 },
      {
        title: "No of Applications",
        width: 160,
        render: (_: any, record: JobPostBase) => {
          const count = record.applications?.length || 0;
          return count.toLocaleString();
        },
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
        render: (_: any, record: JobPostBase) => (
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
      { label: "Hospital Name", key: "hospitalName", type: "text" as const },
      { label: "Location", key: "location", type: "text" as const },
      {
        label: "Employment Type",
        key: "workType",
        type: "checkbox" as const,
        options: ["Full Time", "Part Time", "Contract"],
      },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["OPEN", "CLOSE", "Expired", "Pending"],
      },
    ],
    [],
  );

  const handleDownload = (format: "excel" | "csv") => {
    if (!allJobPost.length) return;
    const headers = [
      "S No",
      "Job Title",
      "Hospital Name",
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
      j.hospitalName,
      j.experience_required,
      j.location,
      j.specialization,
      j.workType,
      j.applications?.length || 0,
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

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Job-Post List</h1>
        {currentRole && currentRole !== "admin" &&(
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="relative -top-0" />
          Post A New Job
        </Button>
        )}
      </div>

      <CommonTable<JobPostBase>
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
          jobPostData={selectedJobPost}
          role={(currentRole || "admin") as UserRole}
        />
      )}
    </div>
  );
};

export default JobPostList;
