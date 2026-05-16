import { CloseOutlined, FileTextOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Drawer, message, Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StatusBadge from "../Common/StatusBadge";
import {
  applicationStatusJobPostApi,
  statusJobPostApi,
} from "../../api/jobpost.api";
import { ApplicantViewDrawerProps } from "./jobPostTypes";

const JobPostApplicantViewDrawer: React.FC<ApplicantViewDrawerProps> = ({
  open,
  onClose,
  applicant,
  onStatusUpdated,
}) => {
  const queryClient = useQueryClient();
  const { modal } = App.useApp();
  if (!applicant) return null;
  const getResolvedResumeUrl = (raw?: string) => {
    const value = (raw || "").trim();
    if (!value) return "";
    if (/^[a-zA-Z]:\\/.test(value)) return "";
    if (/^https?:\/\//i.test(value)) return encodeURI(value);
    if (value.startsWith("www.")) return encodeURI(`https://${value}`);
    if (value.startsWith("/")) {
      if (/^\/(data|storage|var|private)\//i.test(value)) return "";
      const backendBase = String(
        import.meta.env.VITE_API_BASE_URL_BACKEND || "",
      ).replace(/\/api\/?$/i, "");
      if (!backendBase) return "";
      return encodeURI(`${backendBase}${value}`);
    }
    return "";
  };
  const resumeUrl = getResolvedResumeUrl(applicant.resumeUrl);
  const getExtensionFromUrl = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split("/").pop() || "";
      const ext = filename.split(".").pop() || "";
      return ext.toLowerCase();
    } catch {
      const clean = url.split("?")[0].split("#")[0];
      const filename = clean.split("/").pop() || "";
      const ext = filename.split(".").pop() || "";
      return ext.toLowerCase();
    }
  };
  const getResumeViewUrl = (url: string) => {
    const ext = getExtensionFromUrl(url);
    const isOfficeDoc =
      ext === "doc" ||
      ext === "docx" ||
      ext === "ppt" ||
      ext === "pptx" ||
      ext === "xls" ||
      ext === "xlsx";
    if (isOfficeDoc) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        url,
      )}`;
    }
    if (ext === "pdf") {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
        url,
      )}`;
    }
    return url;
  };
  const resumeViewUrl = resumeUrl ? getResumeViewUrl(resumeUrl) : "";

  const normalizedStatus = applicant.status.toLowerCase();

  const isRejected = normalizedStatus === "rejected";
  const isHired = normalizedStatus === "hired";
  const isShortlisted = normalizedStatus === "shortlisted";

  /* -------------------- Mutation -------------------- */
  const { mutate: updateStatus, isPending } = useMutation({
    // mutationFn now accepts a payload object
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationStatusJobPostApi(id, { status }),

    onSuccess: (_, variables) => {
      const statusLabel: Record<string, string> = {
        SHORTLISTED: "Shortlisted",
        REJECTED: "Rejected",
        HIRED: "Hired",
      };

      onStatusUpdated?.(
        applicant.id,
        variables.status as "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED",
      );

      message.success(
        `Applicant ${statusLabel[variables.status] || variables.status} successfully`,
      );
      queryClient.invalidateQueries({
        queryKey: ["jobPosts"],
      });

      onClose();
    },

    onError: () => {
      message.error("Failed to update applicant status");
    },
  });

  const { user } = applicant;

  /* -------------------- Handlers -------------------- */
  const handleStatusUpdate = () => {
    if (normalizedStatus === "shortlisted") {
      modal.confirm({
        title: "Hire Applicant?",
        content: "Are you sure you want to hire this applicant?",
        okText: "Hire",
        okType: "primary",
        onOk: () =>
          updateStatus({
            id: applicant.id,
            status: "HIRED",
          }),
      });
    } else if (
      normalizedStatus !== "rejected" &&
      normalizedStatus !== "hired"
    ) {
      modal.confirm({
        title: "Shortlist Applicant?",
        content: "Are you sure you want to shortlist this applicant?",
        okText: "Shortlist",
        okType: "primary",
        onOk: () =>
          updateStatus({
            id: applicant.id,
            status: "SHORTLISTED",
          }),
      });
    } else {
      message.info("Action cannot be performed on this applicant");
    }
  };

  const handleReject = () => {
    modal.confirm({
      title: "Reject Applicant?",
      content: "Are you sure you want to reject this applicant?",
      okText: "Reject",
      okType: "danger",
      onOk: () =>
        updateStatus({
          id: applicant.id,
          status: "REJECTED",
        }),
    });
  };

  const isFinalStatus =
    normalizedStatus === "rejected" || normalizedStatus === "hired";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={500}
      title="Applicant Details"
      closeIcon={<CloseOutlined />}
      footer={
        <div className="flex justify-between items-center">
          <Button onClick={onClose}>Back</Button>

          {!isFinalStatus && (
            <div className="flex gap-2">
              <Button danger onClick={handleReject} loading={isPending}>
                Reject
              </Button>

              <Button
                type="primary"
                onClick={handleStatusUpdate}
                loading={isPending}
                className=""
              >
                {applicant.status.toLowerCase() === "shortlisted"
                  ? "Hire"
                  : "Shortlist"}
              </Button>
            </div>
          )}
        </div>
      }
    >
      {/* -------------------- Header -------------------- */}
      <div className="flex items-start gap-4 pb-6 border-b">
        <Avatar
          size={64}
          className="bg-button-primary text-white flex-shrink-0"
        >
          {user.first_name?.charAt(0)?.toUpperCase()}
        </Avatar>

        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold leading-tight">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>
      </div>

      {/* -------------------- Status + Applied Date -------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b">
        <div>
          <p className="text-xs text-gray-500 mb-1">Application Status</p>
          <StatusBadge status={applicant.status} />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Applied On</p>
          <p className="text-sm font-medium text-blue-600">
            {new Date(applicant.applied_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* -------------------- Cover Letter -------------------- */}
      {applicant.coverLetter && (
        <div className="py-6 border-b">
          <p className="text-xs text-gray-500 mb-2">Cover Letter</p>
          <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed">
            {applicant.coverLetter}
          </div>
        </div>
      )}

      {/* -------------------- Resume -------------------- */}
      {resumeViewUrl && (
        <div className="pt-6">
          <p className="text-xs text-gray-500 mb-3">Resume</p>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            href={resumeViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            View Resume
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default JobPostApplicantViewDrawer;
