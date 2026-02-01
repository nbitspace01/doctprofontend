import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Drawer,
  message,
  Modal,
  notification,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { JobApplication, JobPostViewDrawerProps } from "./jobPostTypes";
import StatusBadge from "../Common/StatusBadge";
import JobPostApplicantViewDrawer from "./JobPostApplicantViewDrawer";
import { statusJobPostApi } from "../../api/jobpost.api";
import { showError, showSuccess } from "../Common/Notification";

const JobPostViewDrawer: React.FC<JobPostViewDrawerProps> = ({
  open,
  onClose,
  jobPostData,
  role,
}) => {
  const queryClient = useQueryClient();
  const [isHospitalBioExpanded, setIsHospitalBioExpanded] = useState(true);
  const [selectedApplicant, setSelectedApplicant] =
    useState<JobApplication | null>(null);
  const [isApplicantDrawerOpen, setIsApplicantDrawerOpen] = useState(false);
  const { modal, message } = App.useApp();

  // ---------Mutation---------
  const { mutate: updateStatus } = useMutation({
    // mutationFn now accepts a payload object
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      statusJobPostApi(id, {status}),

    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Job Post Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({
        queryKey: ["jobPosts"],
      });
      onClose();
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed To Update",
        description: error.response?.data?.error || "Failed To Update Job Post",
      });
    },
  });

  const candidateColumns: ColumnsType<JobApplication> = [
    {
      title: "S No",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Candidate Name",
      key: "name",
      render: (_, record) =>
        `${record.user.first_name} ${record.user.last_name}`,
    },
    {
      title: "Applied On",
      dataIndex: "applied_at",
      key: "applied_at",
      render: (date: string) => (
        <span className="text-blue-600">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          className="text-blue-600 p-0"
          onClick={() => {
            setSelectedApplicant(record);
            setIsApplicantDrawerOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  /* -------------------- Handlers -------------------- */
  const status = jobPostData.status.toLowerCase();

  const isPending = status === "pending";
  const isActive = status === "open";
  const isInactive = status === "close";

  const getNextStatus = () => {
    if (status === "pending") return "OPEN";
    if (status === "open") return "CLOSED";
    return "OPEN";
  };

  const handleStatus = () => {
    const nextStatus = getNextStatus();
    modal.confirm({
      title: nextStatus === "OPEN" ? "Open Job Post?" : "Close Job Post?",
      content: `Are you sure you want to ${nextStatus} "${jobPostData.title}"?`,
      okType: nextStatus === "CLOSED" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          id: jobPostData.id,
          status: nextStatus,
        }),
    });
  };

  if (!jobPostData) {
    return (
      <Drawer
        title="Ads Post"
        placement="right"
        open={open}
        onClose={onClose}
        width={600}
        closeIcon={<CloseOutlined />}
      >
        <div className="text-center text-gray-500">No data found</div>
      </Drawer>
    );
  }

  return (
    <div>
      <Drawer
        open={open}
        onClose={onClose}
        width={800}
        closeIcon={<CloseOutlined />}
        title="Job post Management"
        footer={
          role === "admin" ? (
            <div className="flex justify-between items-center">
              <Button
                size="large"
                className="bg-gray-200 text-gray-700 px-8"
                onClick={onClose}
              >
                Back
              </Button>


              <div className="flex gap-2">
                <Button
                  size="large"
                  className={`px-8 ${
                    isActive
                      ? "border-red-500 text-red-500"
                      : "border-green-500 text-green-500"
                  }`}
                  onClick={handleStatus}
                >
                  {isActive ? "Close" : "Open"} Job Post
                </Button>
              </div>
            </div>
          ) : null
        }
      >
       <div className="space-y-8">
  {/* Job Details */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
    {/* Left Column */}
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-500 mb-1">Job Title</p>
        <p className="text-sm font-medium">{jobPostData?.title || "N/A"}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Specialization</p>
        <p className="text-sm font-medium">
          {jobPostData?.specialization || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Location</p>
        <p className="text-sm font-medium">
          {jobPostData?.location || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Start Date</p>
        <p className="text-sm font-medium text-blue-600">
          {jobPostData?.valid_from || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">
          No. of Applications Received
        </p>
        <p className="text-sm font-medium">
          {jobPostData?.applications?.length ?? 0}
        </p>
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-500 mb-1">Experience Required</p>
        <p className="text-sm font-medium">
          {jobPostData?.experience_required || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Employment Type</p>
        <p className="text-sm font-medium">
          {jobPostData?.workType || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Status</p>
        <StatusBadge status={jobPostData?.status} />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">End Date</p>
        <p className="text-sm font-medium text-orange-600">
          {jobPostData?.expires_at || "N/A"}
        </p>
      </div>
    </div>
  </div>

  {/* Hospital Bio */}
  {jobPostData?.hospital_bio && (
    <div className="border border-dashed border-blue-300 rounded-lg p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() =>
          setIsHospitalBioExpanded((prev) => !prev)
        }
      >
        <p className="font-semibold">Hospital Bio</p>
        <span className="text-gray-400 text-lg">
          {isHospitalBioExpanded ? "−" : "+"}
        </span>
      </div>

      {isHospitalBioExpanded && (
        <p className="mt-4 text-sm text-gray-700 leading-relaxed">
          {jobPostData.hospital_bio}
        </p>
      )}
    </div>
  )}

  {/* Candidate Applications */}
  {jobPostData?.applications && role !== "admin" && (
    <div>
      <h3 className="font-semibold mb-4">Candidate Applications</h3>
      <Table
        columns={candidateColumns}
        dataSource={jobPostData.applications.map((c) => ({
          ...c,
          key: c.id,
        }))}
        pagination={false}
        size="small"
      />
    </div>
  )}
</div>

      </Drawer>
      <JobPostApplicantViewDrawer
        open={isApplicantDrawerOpen}
        onClose={() => setIsApplicantDrawerOpen(false)}
        applicant={selectedApplicant}
      />
    </div>
  );
};

export default JobPostViewDrawer;
