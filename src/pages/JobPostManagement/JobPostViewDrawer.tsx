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

  const handleRepost = () => {
    modal.confirm({
      title: "Repost Job?",
      content: `This will move "${jobPostData.title}" back to pending approval.`,
      okText: "Repost",
      okType: "primary",
      onOk: () =>
        updateStatus({
          id: jobPostData.id,
          status: "pending",
          repostedAt: new Date().toISOString(),
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
                {role !== "admin" && (
                  <Button size="large" type="primary" onClick={handleRepost}>
                    Repost
                  </Button>
                )}
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
        <div className="space-y-6">
          {/* Job Details - Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Job Tittle</p>
                <p className="font-medium">{jobPostData.title}</p>
              </div>
              <div>
                <p className="text-gray-500">Specialisation</p>
                <p>{jobPostData.specialization}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p>{jobPostData.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="text-blue-600">{jobPostData?.valid_from}</p>
              </div>
              <div>
                <p className="text-gray-500">No of Applications Received</p>
                <p>{jobPostData.noOfApplications}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Exp Required</p>
                <p>{jobPostData.experience_required}</p>
              </div>
              <div>
                <p className="text-gray-500">Employment Type</p>
                <p>{jobPostData.workType}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status={jobPostData.status} />
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="text-orange-600">{jobPostData?.expires_at}</p>
              </div>
            </div>
          </div>

          {/* Hospital Bio */}
          {jobPostData.hospital_bio && jobPostData.hospital_bio.length > 0 && (
            <div className="border-2 border-dashed border-blue-300 p-4 rounded">
              <div
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => setIsHospitalBioExpanded(!isHospitalBioExpanded)}
              >
                <span className="font-semibold">Hospital Bio</span>
                {isHospitalBioExpanded ? (
                  <MinusOutlined />
                ) : (
                  <span className="text-gray-400">+</span>
                )}
              </div>
              {isHospitalBioExpanded && (
                <p className="mt-6"> {jobPostData.hospital_bio}</p>
              )}
            </div>
          )}

          {/* Candidate Applications */}
          {jobPostData.applications && role !== "admin" && (
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
      ;
    </div>
  );
};

export default JobPostViewDrawer;
