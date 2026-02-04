import { App, Avatar, Button, Drawer, Image, Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showSuccess } from "../Common/Notification";
import { ApproveKYCStatusApi, rejectKYCStatusApi } from "../../api/kyc.api";
import StatusBadge from "../Common/StatusBadge";

interface KycDocument {
  document_number: string | null;
  url: string;
  status: string;
  type: string;
}

interface Userdata {
  id: string;
  email: string;
  phone: string;
}

interface kycData {
  kycId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  created_on: string;
  documents?: KycDocument[];
  kyc_status: string;
  user?: Userdata | Userdata[];
}

interface KycViewDrawerProps {
  open: boolean;
  onClose: () => void;
  kycData: kycData;
  onChanged?: () => void;
}

const KycViewDrawer: React.FC<KycViewDrawerProps> = ({
  open,
  onClose,
  kycData,
  onChanged,
}) => {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return rejectKYCStatusApi(id, {
        reason: rejectReason,
        remarks: rejectRemarks,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setRejectModalVisible(false);
      onClose();
      onChanged?.();
      showSuccess(notification, {
        message: "KYC Rejected Successfully",
        description: data?.message || "KYC has been rejected successfully",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return ApproveKYCStatusApi(id);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setApproveModalVisible(false);
      onClose();
      onChanged?.();
      showSuccess(notification, {
        message: "KYC Approved Successfully",
        description: data?.message || "KYC has been approved successfully",
      });
    },
  });

  const handleApprove = () => {
    setApproveModalVisible(true);
  };

  const handleConfirmApprove = () => {
    const userObj = Array.isArray(kycData.user)
      ? kycData.user[0]
      : kycData.user;
    if (!userObj?.id) return;
    approveMutation.mutate(userObj.id);
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleConfirmReject = () => {
    const userObj = Array.isArray(kycData.user)
      ? kycData.user[0]
      : kycData.user;
    if (!userObj?.id) return;
    rejectMutation.mutate(userObj.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Drawer
        title="KYC Management"
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
        footer={
          <div className="flex justify-between gap-3">
            {/* Cancel */}
            <Button size="large" onClick={onClose} className="px-6 bg-gray-100">
              Cancel
            </Button>

            <div className="flex gap-2">
              {/* Reject */}
              <Button
                disabled={kycData.documents?.some(
                  (doc) => doc.status === "REJECTED",
                )}
                danger
                size="large"
                loading={rejectMutation.isPending}
                onClick={handleReject}
                className="px-6"
              >
                Reject
              </Button>

              {/* Approve */}
              <Button
                disabled={kycData.documents?.some(
                  (doc) => doc.status === "APPROVED",
                )}
                type="primary"
                size="large"
                loading={approveMutation.isPending}
                onClick={handleApprove}
                className="px-6"
              >
                Approve
              </Button>
            </div>
          </div>
        }
      >
        {kycData ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar size={48} className="bg-button-primary text-white">
                {kycData.name?.charAt(0)}
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  {kycData.name}
                </h3>
                <p className="text-sm text-gray-500">{kycData.role}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{kycData.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{kycData.phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p className="font-medium">{formatDate(kycData.created_on)}</p>
              </div>
            </div>

            {/* KYC Documents */}
            <div>
              <h4 className="font-medium mb-4">KYC Documents</h4>

              <div className="space-y-4">
                {kycData.documents?.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">{doc.type}</span>

                      <StatusBadge status={doc.status.toUpperCase()} />
                    </div>

                    <Image
                      src={doc.url}
                      alt={doc.type}
                      className="w-full h-44 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        title="Approve KYC"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleConfirmApprove}
        okText="Yes"
        cancelText="Cancel"
        okButtonProps={{
          className: "bg-blue-600",
          loading: approveMutation.isPending,
        }}
      >
        <p>Are you sure you want to approve this KYC?</p>
      </Modal>

      <Modal
        title="Reject KYC Submission"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleConfirmReject}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{
          className: "bg-blue-600",
          loading: rejectMutation.isPending,
          disabled: !rejectReason,
        }}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2">Reason</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Reason</option>
              <option value="invalid_documents">Invalid Documents</option>
              <option value="incomplete_information">
                Incomplete Information
              </option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <p className="mb-2">Remarks</p>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Type Something...."
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KycViewDrawer;
