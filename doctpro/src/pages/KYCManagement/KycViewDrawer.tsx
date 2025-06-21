import { Avatar, Button, Drawer, Image, Modal } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../Common/Loader";
import { useState } from "react";

interface KycDocument {
  document_number: string | null;
  url: string;
  status: string;
  type: string;
}

interface KycDetails {
  name: string;
  role: string;
  email: string;
  phone: string;
  created_on: string;
  documents: KycDocument[];
}

interface KycViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kycId: string;
}

const fetchKycDetails = async (kycId: string) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { data } = await axios.get<KycDetails>(
    `${API_URL}/api/kyc/kyc-submissions/${kycId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    }
  );
  return data;
};

const KycViewDrawer: React.FC<KycViewDrawerProps> = ({
  isOpen,
  onClose,
  kycId,
}) => {
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const { data: kycDetails, isLoading } = useQuery({
    queryKey: ["kycDetails", kycId],
    queryFn: () => fetchKycDetails(kycId),
    enabled: isOpen && !!kycId,
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`${API_URL}/api/kyc/kyc-submissions/${id}/reject`, {
        reason: rejectReason,
        remarks: rejectRemarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setRejectModalVisible(false);
      onClose();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`${API_URL}/api/kyc/kyc-submissions/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      setApproveModalVisible(false);
      onClose();
    },
  });

  const handleApprove = () => {
    setApproveModalVisible(true);
  };

  const handleConfirmApprove = () => {
    approveMutation.mutate(kycId);
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleConfirmReject = () => {
    rejectMutation.mutate(kycId);
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
        open={isOpen}
        width={400}
      >
        {isLoading ? (
          <Loader size="large" />
        ) : kycDetails ? (
          <div className="space-y-6">
            <div className="flex items-center ">
              <div className="" />
              <Avatar
                size={48}
                className="bg-button-primary  rounded-full mr-2 text-white"
              >
                {kycDetails.name?.charAt(0)}
              </Avatar>
              <div className="flex flex-col items-center">
                <h3 className="font-medium text-lg !mt-2">{kycDetails.name}</h3>
                <p className="text-gray-500">{kycDetails.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Email Address</p>
                <p>{kycDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone Number</p>
                <p>{kycDetails.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Created on</p>
                <p>{formatDate(kycDetails.created_on)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">KYC Documents</h4>
              <div className="space-y-4">
                {kycDetails.documents?.map((doc, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{doc.type}</span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          doc.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <Image
                      src={doc.url}
                      alt={doc.type}
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="flex-1 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
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
