import { App, Avatar, Button, Drawer, message, Tag } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import FormattedDate from "../../Common/FormattedDate";
import StatusBadge from "../../Common/StatusBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/api";

export interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  adminUserId: string | null;
}

interface ClinicViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalData: HospitalData;
}

const ClinicViewDrawer = ({
  isOpen,
  onClose,
  hospitalData,
}: ClinicViewDrawerProps) => {
  const {modal} = App.useApp();

  const queryClient = useQueryClient();

  const toggleHospitalStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`/api/hospital-admin/${id}/status`, {
        status,
      }),
    onSuccess: () => {
      message.success("Hospital status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      onClose();
    },
    onError: () => {
      message.error("Failed to update hospital status");
    },
  });

  const handleToggleStatus = () => {
    const status = hospitalData.status.toUpperCase();

    // Decide action
    const willActivate = status === "INACTIVE" || status === "PENDING";

    modal.confirm({
      title: willActivate ? "Activate Hospital" : "Deactivate Hospital",
      content: `Are you sure you want to ${
        willActivate ? "activate" : "deactivate"
      } this hospital?`,
      okText: willActivate ? "Activate" : "Deactivate",
      cancelText: "Cancel",
      okType: willActivate ? "primary" : "danger",
      onOk: () => {
        toggleHospitalStatusMutation.mutate({
          id: hospitalData.id,
          status: willActivate ? "ACTIVE" : "INACTIVE",
        });
      },
    });
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={720}
      title="Hospital Admin Details"
      footer={
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
      }}
    >
      {/* Back / Cancel Button */}
      <Button onClick={onClose}>
        Back
      </Button>

      {/* Activate / Deactivate Button */}
      <Button
        type="primary"
        danger={hospitalData.status === "ACTIVE"}
        loading={toggleHospitalStatusMutation.isPending}
        onClick={handleToggleStatus}
      >
        {hospitalData.status === "ACTIVE" ? "Deactivate" : "Activate"}
      </Button>
    </div>
  }
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={64} className="bg-button-primary text-white">
            {hospitalData.name.charAt(0)}
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{hospitalData.name}</h2>
            <p className="text-gray-500">{hospitalData.branchLocation}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600">Address</p>
            <p>
              {hospitalData.city}, {hospitalData.state}, {hospitalData.country}
            </p>
          </div>

          <div>
            <p className="text-gray-600">Created On</p>
            <FormattedDate dateString={hospitalData.created_at} format="long" />
          </div>

          <div>
            <p className="text-gray-600">Status</p>
            <Tag>
              <StatusBadge status={hospitalData.status} />
            </Tag>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <MailOutlined /> Email
            </p>
            <p>{hospitalData.email}</p>
          </div>

          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <PhoneOutlined /> Phone
            </p>
            <p>{hospitalData.phone}</p>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-6">
          <p className="text-gray-600">Admin Assigned</p>
          <p>{hospitalData.adminUserId ? "Yes" : "No admin assigned"}</p>
        </div>
      </div>
    </Drawer>
  );
};

export default ClinicViewDrawer;
