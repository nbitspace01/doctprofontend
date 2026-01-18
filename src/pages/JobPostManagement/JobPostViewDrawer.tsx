import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { Avatar, Button, Drawer, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import PaymentModal from "./PaymentModal";
import { fetchJobPostByIdApi } from "../../api/jobpost.api";
import { useQuery } from "@tanstack/react-query";

interface JobPostDetail {
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
  paymentStatus?: string;
  postedBy?: {
    name: string;
    imageUrl?: string;
  };
  hospitalBio?: string;
  candidates?: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  appliedOn: string;
  resume: string;
  status: string;
}

interface JobPostViewDrawerProps {
  open: boolean;
  onClose: () => void;
  jobPostId: string;
}

const JobPostViewDrawer: React.FC<JobPostViewDrawerProps> = ({
  open,
  onClose,
  jobPostId,
}) => {
  const [isHospitalBioExpanded, setIsHospitalBioExpanded] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // const { data: jobPost, isFetching } = useQuery({
  //   queryKey: ["jobPosts", jobPostId],
  //   queryFn: () => fetchJobPostByIdApi(jobPostId),
  //   enabled: !!jobPostId, // 👈 VERY IMPORTANT
  //   refetchOnWindowFocus: false,
  // });

  // console.log(jobPost);
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getMockJobPost = (id: string): JobPostDetail => {
    const statusMap: Record<string, string> = {
      "1": "Active",
      "2": "Expiring Soon",
      "3": "Expired",
      "4": "Pending",
    };
    return {
      id: id || "1",
      jobTitle: "Senior Consultant",
      specialization: "MBBS - General Medicine",
      location: "Chennai",
      valid_from: "2025-06-12",
      noOfApplications: 23,
      experience_required: "5 - 8 Yrs",
      workType: "Full Time",
      expires_at: "2025-08-12",
      paymentStatus: "Paid",
      status: statusMap[id] || "Active",
      postedBy: { name: "Vinoth Kumar", imageUrl: "" },
      hospital_bio: [
        "Oversees day-to-day administrative operations in medical departments or healthcare facilities.",
        "Coordinates schedules, staff assignments, and workflow to ensure efficient patient care services.",
        "Ensures compliance with healthcare regulations, hospital policies, and accreditation standards.",
        "Manages medical records, patient data systems, and documentation processes.",
        "Liaises between medical staff, patients, and hospital management for smooth communication.",
      ],
      candidates: [
        {
          id: "1",
          name: "Vinoth Kumar",
          appliedOn: "2025-06-12",
          resume: "",
          status: "Hired",
        },
        {
          id: "2",
          name: "Vinoth Kumar",
          appliedOn: "2025-06-12",
          resume: "",
          status: "Shortlisted",
        },
        {
          id: "3",
          name: "Vinoth Kumar",
          appliedOn: "2025-06-12",
          resume: "",
          status: "Rejected",
        },
      ],
    };
  };

  const jobPost = getMockJobPost(jobPostId || "1");

  const getStatusColor = (status: string) =>
    ({
      Active: "green",
      Expired: "red",
      "Expiring Soon": "orange",
      Pending: "orange",
    })[status] || "default";

  const getCandidateStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      Hired: "green",
      Shortlisted: "blue",
      Rejected: "red",
    };
    return <Tag color={colors[status]}>{status}</Tag>;
  };

  const handleClosePost = () => {
    Modal.confirm({
      title: "Close Post",
      content: "Are you sure you want to close this job post?",
      onOk: () => {
        onClose();
      },
    });
  };

  const handleRenewPost = () => {
    Modal.confirm({
      title: "Renew Post",
      content: "Are you sure you want to renew this job post?",
      onOk: () => {
        onClose();
      },
    });
  };

  const handleProceedToPay = () => {
    setIsPaymentModalOpen(true);
  };

  const handleRepost = () => {
    Modal.confirm({
      title: "Repost",
      content: "Are you sure you want to repost this job?",
      onOk: () => {
        onClose();
      },
    });
  };

  const candidateColumns: ColumnsType<Candidate> = [
    {
      title: "S No",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Candidate Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Applied On",
      dataIndex: "appliedOn",
      key: "appliedOn",
      render: (date: string) => (
        <span className="text-blue-600">{formatDate(date)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getCandidateStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button type="link" className="text-blue-600 p-0">
          View
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={800}
      closeIcon={null}
      title={
        <div className="flex justify-between items-center">
          <span>Job post Management</span>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Job Details - Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Job Tittle</p>
              <p className="font-medium">{jobPost.title}</p>
            </div>
            <div>
              <p className="text-gray-500">Specialisation</p>
              <p>{jobPost.specialization}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p>{jobPost.location}</p>
            </div>
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="text-blue-600">{formatDate(jobPost?.valid_from)}</p>
            </div>
            <div>
              <p className="text-gray-500">No of Applications Received</p>
              <p>{jobPost.noOfApplications}</p>
            </div>
            {jobPost.postedBy && (
              <div>
                <p className="text-gray-500">Posted by</p>
                <div className="flex items-center gap-2 mt-2">
                  {jobPost.postedBy.imageUrl ? (
                    <Avatar src={jobPost.postedBy.imageUrl} />
                  ) : (
                    <Avatar className="bg-button-primary text-white">
                      {jobPost.postedBy.name.charAt(0)}
                    </Avatar>
                  )}
                  <p>{jobPost.postedBy.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Exp Required</p>
              <p>{jobPost.experience_required}</p>
            </div>
            <div>
              <p className="text-gray-500">Employment Type</p>
              <p>{jobPost.workType}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <Tag color={getStatusColor(jobPost.status)}>{jobPost.status}</Tag>
            </div>
            <div>
              <p className="text-gray-500">End Date</p>
              <p className="text-orange-600">
                {formatDate(jobPost?.expires_at)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payment Status</p>
              <span className="text-blue-600">
                {jobPost?.paymentStatus || "Paid"}
              </span>
            </div>
          </div>
        </div>

        {/* Hospital Bio */}
        {jobPost.hospital_bio && jobPost.hospital_bio.length > 0 && (
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
              <p className="mt-6"> {jobPost.hospital_bio}</p>
              // <ol className="list-decimal list-inside space-y-1 ml-4">

              // </ol>
            )}
          </div>
        )}

        {/* Candidate Applications */}
        {jobPost.candidates && jobPost.candidates.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Candidate Applications</h3>
            <Table
              columns={candidateColumns}
              dataSource={jobPost.candidates.map((c, idx) => ({
                ...c,
                id: (idx + 1).toString(),
                key: c.id,
              }))}
              pagination={false}
              size="small"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-between pt-4 border-t">
          <div>
            {jobPost.status === "Active" && (
              <Button
                onClick={handleRepost}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Repost
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {jobPost.status === "Active" ? (
              <>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="primary"
                  onClick={handleClosePost}
                  className="bg-button-primary"
                >
                  Close Post
                </Button>
              </>
            ) : jobPost.status === "Expired" ||
              jobPost.status === "Expiring Soon" ? (
              <>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="primary"
                  onClick={handleRenewPost}
                  className="bg-button-primary"
                >
                  Renew Post
                </Button>
              </>
            ) : jobPost.status === "Pending" ? (
              <>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="primary"
                  onClick={handleProceedToPay}
                  className="bg-button-primary"
                >
                  Proceed to Pay
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>Cancel</Button>
            )}
          </div>
        </div>
      </div>
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={5600}
      />
    </Drawer>
  );
};

export default JobPostViewDrawer;
