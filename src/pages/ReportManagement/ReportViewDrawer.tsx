import { Drawer, Button, Tag, Space, Select, Spin, Image, App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchReportByIdApi,
  updateReportStatusApi,
  deletePostByIdApi,
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

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const isReviewed = viewData?.status === "REVIEWED";
  const isPendingMutation = statusUpdating;

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
    if (!viewData?.postId) return;

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

          await deletePostByIdApi(viewData.postId);
          await updateReportStatusApi(viewData.id, "REVIEWED");

          message.success("Post deleted and report marked reviewed");

          queryClient.invalidateQueries({ queryKey: ["reports"] });
          queryClient.invalidateQueries({
            queryKey: ["report", viewId],
          });

          onClose();
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
            {viewData?.postId && (
              <Button size="large" className="px-8" danger loading={deletingPost} onClick={handleDeletePost}>
                Delete Post
              </Button>
            )}

            <Button
              size="large"
              loading={isPendingMutation}
              disabled={isPendingMutation}
              className={`px-8 ${
                isReviewed
                  ? "border-orange-500 text-orange-500"
                  : "border-green-500 text-green-500"
              }`}
              onClick={handleStatusToggle}
            >
              {isReviewed ? "Mark Pending" : "Mark Reviewed"}
            </Button>
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
              <div className="text-xs text-gray-500">Post ID</div>
              <div className="text-sm font-medium mt-1">
                {viewData.postId || "NA"}
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
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-sm font-medium mt-2">
               <StatusBadge status={viewData.status || "PENDING"} />
              </div>
            </div>
          </div>

          {viewData.post && (
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
        </div>
      ) : null}
    </Drawer>
  );
};

export default ReportViewDrawer;
