import React, { useMemo } from "react";
import { App, Avatar, Button, Drawer, Image, Tag } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubAdminUpdate } from "../../api/admin.api";
import StatusBadge from "../Common/StatusBadge";

interface SubAdminData {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  role: string;
  location?: string;
  organization_type: string;
  status: string;
  active_user: boolean;
  profile_image?: string;
  image_url?: string;
  state?: string;
  district?: string;
}

interface ViewSubAdminProps {
  open: boolean;
  onClose: () => void;
  subAdminData: SubAdminData;
}

const SubAdminViewDrawer: React.FC<ViewSubAdminProps> = ({
  open,
  onClose,
  subAdminData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (subAdminData.name) return subAdminData.name;

    const fullName = `${subAdminData.first_name || ""} ${
      subAdminData.last_name || ""
    }`.trim();

    return fullName || "N/A";
  }, [subAdminData]);

  const avatarInitial = useMemo(() => {
    if (subAdminData.name) return subAdminData.name[0].toUpperCase();
    if (subAdminData.first_name)
      return subAdminData.first_name[0].toUpperCase();
    return subAdminData.email?.[0]?.toUpperCase() || "A";
  }, [subAdminData]);

  const profileImage =
    subAdminData.profile_image || subAdminData.image_url || "";

  const isActive = subAdminData.status === "ACTIVE";

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({
      subAdminId,
      status,
    }: {
      subAdminId: string;
      status: "ACTIVE" | "INACTIVE";
    }) => SubAdminUpdate(subAdminId, { status }),

    onSuccess: (_, variables) => {
      // Update all matching subAdmin queries in cache
      queryClient.setQueriesData<any>(
        { queryKey: ["subAdmin"], exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((item: any) =>
              item.id === variables.subAdminId
                ? { ...item, status: variables.status }
                : item,
            ),
          };
        },
      );

      message.success("Status updated successfully");
      onClose();
    },

    onError: () => {
      message.error("Failed to update sub admin status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleStatusToggle = () => {
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";

    modal.confirm({
      title: isActive ? "Deactivate Sub Admin?" : "Activate Sub Admin?",
      content: `Are you sure you want to ${
        isActive ? "deactivate" : "activate"
      } "${displayName}"?`,
      okText: "Yes",
      cancelText: "No",
      okType: isActive ? "danger" : "primary",
      onOk: () =>
        updateStatus({
          subAdminId: subAdminData.id,
          status: nextStatus,
        }),
    });
  };

  return (
    <Drawer
      title="Sub Admin"
      placement="right"
      open={open}
      onClose={onClose}
      width={400}
      className="custom-drawer"
      footer={
        <div className="flex justify-between items-center">
          <Button
            size="large"
            className="bg-gray-200 text-gray-700 px-8"
            onClick={onClose}
          >
            Back
          </Button>

          <Button
            size="large"
            loading={isPending}
            className={`px-8 ${
              isActive
                ? "border-red-500 text-red-500"
                : "border-green-500 text-green-500"
            }`}
            onClick={handleStatusToggle}
          >
            {isActive ? "Deactivate" : "Activate"} Sub Admin
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* Profile */}
        <div className="flex items-center space-x-4">
          {profileImage ? (
            <Image
              src={profileImage}
              width={40}
              height={40}
              alt="Sub Admin"
              className="rounded-full"
            />
          ) : (
            <Avatar
              size={40}
              className="bg-button-primary text-white rounded-full"
            >
              {avatarInitial}
            </Avatar>
          )}

          <div>
            <h3 className="text-lg font-semibold">{displayName}</h3>
            <p className="text-gray-600">{subAdminData.email || "N/A"}</p>
          </div>
        </div>

        {/* Two-column layout for details */}
        <div className="flex flex-wrap -mx-2">
          {/* Phone Number */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{subAdminData.phone || "N/A"}</p>
          </div>

          {/* Role */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">Role</p>
            <Tag color="green">{subAdminData.role || "N/A"}</Tag>
          </div>

          {/* Organisation Type */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">Organisation Type</p>
            <p className="font-medium">
              {subAdminData.organization_type || "N/A"}
            </p>
          </div>

          {/* State */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium">{subAdminData.state || "N/A"}</p>
          </div>

          {/* District */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">District</p>
            <p className="font-medium">{subAdminData.district || "N/A"}</p>
          </div>

          {/* Location (if available) */}
          {subAdminData.location && (
            <div className="w-1/2 px-2 mb-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{subAdminData.location}</p>
            </div>
          )}

          {/* Status */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium"><StatusBadge status={subAdminData.status || "N/A"} /></p>
          </div>

          {/* Active User */}
          <div className="w-1/2 px-2 mb-4">
            <p className="text-sm text-gray-500">Active User</p>
            <p className="font-medium">
              {subAdminData.active_user ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SubAdminViewDrawer;
