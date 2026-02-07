import { App, Avatar, Button, Drawer, Image, message, Tag } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import FormattedDate from "../../Common/FormattedDate";
import StatusBadge from "../../Common/StatusBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/api";
import { updateHospitalAdminStatusApi } from "../../../api/hospitalAdmin.api";

export interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  address?: string;
  city?: string;
  district?: string;
  districtId?: string;
  state?: string;
  stateId?: string;
  country?: string;
  countryId?: string;
  type?: string;
  zipcode?: string;
  email: string;
  phone: string;
  status: string;
  logoUrl?: string;
  created_at: string;
  adminUserId: string | null;
  hr_full_name?: string;
  hr_email?: string;
  hr_phone?: string;
  website?: string;
  adminUser?: { id: string; email?: string; phone?: string; status?: string };
  kyc?: {
    adminIdProof?: {
      type?: string;
      url?: string;
      number?: string;
      status?: string;
    } | null;
    hospitalLicense?: {
      type?: string;
      url?: string;
      number?: string;
      status?: string;
    } | null;
  };
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
  const { modal } = App.useApp();

  const queryClient = useQueryClient();

  const toggleHospitalStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateHospitalAdminStatusApi(id, status),
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
    const willActivate =
      status === "INACTIVE" || status === "PENDING" || status === "DRAFT";

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
      width={500}
      title="Hospital Admin Details"
      footer={
        <div className="flex justify-between items-center">
          <Button
            size="large"
            className="bg-gray-200 text-gray-700 px-8"
            onClick={onClose}
          >
            Back
          </Button>

          {/* Activate / Deactivate Button */}
          <Button
            size="large"
            loading={toggleHospitalStatusMutation.isPending}
            className={`px-8 ${
              hospitalData.status === "ACTIVE"
                ? "border-red-500 text-red-500"
                : "border-green-500 text-green-500"
            }`}
            onClick={handleToggleStatus}
          >
            {hospitalData.status === "ACTIVE" ? "Deactivate" : "Activate"}{" "}
            Hospital Admin
          </Button>
        </div>
      }
    >
      <div className="px-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {hospitalData.logoUrl ? (
            <Image
              src={hospitalData.logoUrl}
              width={70}
              height={70}
              alt="Hospital Logo"
              className="rounded-full"
            />
          ) : (
            <Avatar
              size={60}
              className="bg-button-primary text-white rounded-full"
            >
              {hospitalData.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}

          <div>
            <h2 className="text-xl font-semibold">{hospitalData.name}</h2>
            <p className="text-gray-500">{hospitalData.branchLocation}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">
              {hospitalData.branchLocation}, {hospitalData.state}, {hospitalData.country}
            </p>
          </div>

          <div>
            <p className="text-gray-600">Created On</p>
            <p className="font-medium">
              <FormattedDate
                dateString={hospitalData.created_at}
                format="long"
              />
            </p>
          </div>

          <div>
            <p className="text-gray-600">Status</p>
            <StatusBadge status={hospitalData.status} />
          </div>
          {/* Admin Info */}
          <div>
            <p className="text-gray-600">Admin Assigned</p>
            <p className="font-medium">
              {hospitalData.adminUserId ? "Yes" : "No admin assigned"}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <MailOutlined /> Email
            </p>
            <p className="font-medium">{hospitalData.email}</p>
          </div>

          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <PhoneOutlined /> Phone
            </p>
            <p className="font-medium">{hospitalData.phone}</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ClinicViewDrawer;
