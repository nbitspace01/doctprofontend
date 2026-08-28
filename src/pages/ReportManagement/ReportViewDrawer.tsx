import { Drawer, Button, Spin, Image, App, Alert } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  updateReportStatusApi,
  deleteReportedPostApi,
  deleteReportedJobPostApi,
  suspendReportedUserApi,
  activateReportedUserApi,
} from "../../api/report.api";
import StatusBadge from "../Common/StatusBadge";

interface ReportViewDrawerProps {
  viewId: string | null;
  onClose: () => void;
  viewData: any;
  viewLoading: boolean;
}

const ReportViewDrawer = ({
  viewId,
  onClose,
  viewData,
  viewLoading,
}: ReportViewDrawerProps) => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  const [deletingPost, setDeletingPost] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const isReviewed = viewData?.status === "REVIEWED";
  const isPending = (viewData?.status || "PENDING") === "PENDING";
  // DELETED / SUSPENDED are written by the action handlers — an admin should
  // not be able to hand-edit them back, so the manual toggle only appears
  // while the report is still in one of the two human-chosen states.
  const canToggleStatus = isPending || isReviewed;
  const isPostReport = (viewData?.report_type || "POST") === "POST";
  const isJobPostReport = viewData?.report_type === "JOB_POST";
  const isUserReport = viewData?.report_type === "USER";
  const isMessageReport = viewData?.report_type === "MESSAGE";
  const isDeletedPost = Boolean(viewData?.postDeleted);
  const reportedUser = viewData?.reportedUser ?? null;
  // The account row is the source of truth for access, not the report row.
  const isUserSuspended =
    reportedUser?.isActive === false || reportedUser?.status === "INACTIVE";
  const targetId =
    viewData?.targetId ||
    viewData?.postId ||
    viewData?.jobPostId ||
    viewData?.reportedUserId;

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      updateReportStatusApi(reportId, status),

    onSuccess: (_, variables) => {
      message.success(`Report marked as ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", viewId] });
      onClose();
    },

    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update report status",
      );
    },
  });
  const getNextStatus = () =>
    viewData?.status === "REVIEWED" ? "PENDING" : "REVIEWED";

  const handleStatusToggle = () => {
    if (!viewId || !viewData) return;

    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "REVIEWED"
          ? "Mark report as reviewed?"
          : "Mark report as pending?",
      content: `Are you sure you want to mark this report as ${nextStatus}?`,
      okType: nextStatus === "REVIEWED" ? "primary" : "default",
      onOk: () =>
        updateStatusMutation.mutate({
          reportId: viewId,
          status: nextStatus,
        }),
    });
  };

  const handleDeletePost = () => {
    if (!isPostReport || !viewData?.postId) return;

    modal.confirm({
      title: "Delete this post?",
      content:
        "This action cannot be undone. The post will be permanently deleted and the report will be marked as reviewed.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => {
        try {
          setDeletingPost(true);

          await deleteReportedPostApi(viewData.id);

          message.success("Post deleted and report marked reviewed");

          queryClient.invalidateQueries({ queryKey: ["reports"] });
          queryClient.invalidateQueries({
            queryKey: ["report", viewId],
          });
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to delete post",
          );
        } finally {
          setDeletingPost(false);
        }
      },
    });
  };

  const handleDeleteJobPost = () => {
    if (!isJobPostReport || !viewData?.jobPostId) return;

    modal.confirm({
      title: "Delete this job post?",
      content:
        "This action cannot be undone. The job post will be permanently deleted and the report will be marked as reviewed.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setDeletingPost(true);

          await deleteReportedJobPostApi(viewData.id);

          message.success("Job post deleted and report marked reviewed");

          queryClient.invalidateQueries({ queryKey: ["reports"] });
          queryClient.invalidateQueries({
            queryKey: ["report", viewId],
          });
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to delete job post",
          );
        } finally {
          setDeletingPost(false);
        }
      },
    });
  };

  const handleUserAccessToggle = () => {
    if ((!isUserReport && !isMessageReport) || !viewData?.id || !reportedUser) {
      return;
    }
    const suspending = !isUserSuspended;

    modal.confirm({
      title: suspending ? "Suspend this user?" : "Activate this user?",
      content: suspending
        ? `${reportedUser.name || "This user"} will be blocked from logging in. The report will be marked as reviewed. You can activate them again later.`
        : `${reportedUser.name || "This user"} will be able to log in again.`,
      okText: suspending ? "Suspend" : "Activate",
      okType: suspending ? "danger" : "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setUpdatingUser(true);
          if (suspending) {
            await suspendReportedUserApi(viewData.id);
            message.success("User suspended and report marked reviewed");
          } else {
            await activateReportedUserApi(viewData.id);
            message.success("User activated");
          }
          queryClient.invalidateQueries({ queryKey: ["reports"] });
          queryClient.invalidateQueries({ queryKey: ["report", viewId] });
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ||
              err?.message ||
              (suspending
                ? "Failed to suspend user"
                : "Failed to activate user"),
          );
        } finally {
          setUpdatingUser(false);
        }
      },
    });
  };

  return (
    <Drawer
      open={!!viewId}
      width={520}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
            {viewData?.reportedBy?.name?.[0]?.toUpperCase() || "R"}
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold">
              {viewData?.reportedBy?.name || "Report"}
            </div>
            <div className="text-xs text-gray-500">
              {viewData?.reportedBy?.email || ""}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center">
          {/* Left side */}
          <Button
            size="large"
            className="bg-gray-200 text-gray-700 px-8"
            onClick={onClose}
          >
            Back
          </Button>

          {/* Right side */}
          <div className="flex gap-2">
            {isPostReport && viewData?.postId && !isDeletedPost && (
              <Button size="large" className="px-8" danger loading={deletingPost} onClick={handleDeletePost}>
                Delete Post
              </Button>
            )}
            {isJobPostReport && viewData?.jobPostId && !isDeletedPost && (
              <Button size="large" className="px-8" danger loading={deletingPost} onClick={handleDeleteJobPost}>
                Delete Job Post
              </Button>
            )}
            {(isUserReport || isMessageReport) && reportedUser && (
              <Button
                size="large"
                className={`px-8 ${
                  isUserSuspended ? "border-green-500 text-green-500" : ""
                }`}
                danger={!isUserSuspended}
                loading={updatingUser}
                onClick={handleUserAccessToggle}
              >
                {isUserSuspended ? "Activate User" : "Suspend User"}
              </Button>
            )}

            {canToggleStatus && (
              <Button
                size="large"
                loading={updateStatusMutation.isPending}
                disabled={updateStatusMutation.isPending}
                className={`px-8 ${
                  isReviewed
                    ? "border-orange-500 text-orange-500"
                    : "border-green-500 text-green-500"
                }`}
                onClick={handleStatusToggle}
              >
                {isReviewed ? "Mark Pending" : "Mark Reviewed"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {viewLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : viewData ? (
        <div className="space-y-4">
          {isDeletedPost && (
            <Alert
              type="warning"
              showIcon
              message={isJobPostReport ? "This job post was deleted" : "This post was deleted"}
              description={
                viewData?.postDeletedAt
                  ? `Deleted on ${new Date(viewData.postDeletedAt).toLocaleString()}`
                  : undefined
              }
            />
          )}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
            <div>
              <div className="text-xs text-gray-500">Report ID</div>
              <div className="text-sm font-medium mt-1">{viewData.id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Type</div>
              <div className="text-sm font-medium mt-1">
                {viewData.report_type || "Post"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Target ID</div>
              <div className="text-sm font-medium mt-1">
                {targetId || "NA"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reason</div>
              <div className="text-sm font-medium mt-1">{viewData.reason}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Description</div>
              <div className="text-sm font-medium mt-1">
                {viewData.description || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reported By</div>
              <div className="text-sm font-medium mt-1">
                {viewData.reportedBy?.name || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reporter Email</div>
              <div className="text-sm font-medium mt-1">
                {viewData.reportedBy?.email || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Created At</div>
              <div className="text-sm font-medium mt-1">
                {viewData.created_at
                  ? new Date(viewData.created_at).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Deleted At</div>
              <div className="text-sm font-medium mt-1">
                {viewData.postDeletedAt
                  ? new Date(viewData.postDeletedAt).toLocaleString()
                  : isDeletedPost
                    ? "Deleted date unavailable"
                    : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-sm font-medium mt-2">
               <StatusBadge status={viewData.status || "PENDING"} />
              </div>
            </div>
          </div>

          {isMessageReport && (
            <Alert
              type="info"
              showIcon
              message="Reported conversation"
              description={
                <span>
                  Private messages are not shown here. The reporter and the
                  other participant are listed below — act on the account if
                  the complaint is upheld.
                </span>
              }
            />
          )}

          {(isUserReport || isMessageReport) && (
            <div className="border rounded p-4 bg-gray-50 space-y-3">
              <div className="text-gray-500 text-sm">
                {isMessageReport ? "Other Participant" : "Reported User"}
              </div>
              {reportedUser ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-red-100 text-red-700 flex items-center justify-center text-lg font-semibold shrink-0">
                      {reportedUser.profileImage ? (
                        <Image
                          src={reportedUser.profileImage}
                          alt={reportedUser.name || "user"}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover" }}
                          fallback="https://via.placeholder.com/48?text=U"
                        />
                      ) : (
                        reportedUser.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">
                        {reportedUser.name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reportedUser.email || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm font-medium mt-1">
                        {reportedUser.phone || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">User Type</div>
                      <div className="text-sm font-medium mt-1">
                        {reportedUser.userType || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Account Status</div>
                      <div className="text-sm font-medium mt-2">
                        <StatusBadge
                          status={isUserSuspended ? "INACTIVE" : "ACTIVE"}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Total Reports Against
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {viewData.reportedUserTotalReports ?? 1}
                      </div>
                    </div>
                  </div>
                  {isUserSuspended && (
                    <Alert
                      type="warning"
                      showIcon
                      message="This user is suspended and cannot log in"
                    />
                  )}
                </>
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message={
                    isMessageReport
                      ? "This was a group conversation, or the account no longer exists"
                      : "This user account no longer exists"
                  }
                />
              )}
            </div>
          )}

          {viewData.post && !isDeletedPost && (
            <div className="space-y-2">
              <div className="text-gray-500 text-sm">Post Content</div>
              <div className="whitespace-pre-wrap border rounded p-3 bg-gray-50 text-sm">
                {viewData.post.content || "-"}
              </div>

              {Array.isArray(viewData.post.media_urls) &&
                viewData.post.media_urls.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-gray-500 text-sm">Media</div>
                    <div className="grid grid-cols-2 gap-8">
                      {viewData.post.media_urls.map((url: string) => (
                        <Image
                          key={url}
                          src={url}
                          alt="post media"
                          style={{ maxHeight: 160, objectFit: "cover" }}
                          fallback="https://via.placeholder.com/200?text=Media"
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {viewData.jobPost && (
            <div className="space-y-2">
              <div className="text-gray-500 text-sm">Job Title</div>
              <div className="whitespace-pre-wrap border rounded p-3 bg-gray-50 text-sm">
                {viewData.jobPost.title || "-"}
              </div>
              <div className="text-gray-500 text-sm">Organization</div>
              <div className="whitespace-pre-wrap border rounded p-3 bg-gray-50 text-sm">
                {viewData.jobPost.organization || "-"}
              </div>
              <div className="text-gray-500 text-sm">Job Description</div>
              <div className="whitespace-pre-wrap border rounded p-3 bg-gray-50 text-sm">
                {viewData.jobPost.description || "-"}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Drawer>
  );
};

export default ReportViewDrawer;
