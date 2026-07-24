import React, { useMemo } from "react";
import { Drawer, Button, Avatar, Spin, App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import StatusBadge from "../../Common/StatusBadge";
import { updateOrganizationApi } from "../../../api/organization.api";
import { OrganizationData } from "./AddOrganizationModal";
import {
  getOrganizationType,
  type OrganizationTypeSlug,
} from "./organizationTypes";

interface OrganizationViewDrawerProps {
  type: OrganizationTypeSlug;
  open: boolean;
  onClose: () => void;
  organizationData: OrganizationData;
}

type OrganizationStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const OrganizationViewDrawer: React.FC<OrganizationViewDrawerProps> = ({
  type,
  open,
  onClose,
  organizationData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();
  const { label, queryKey } = getOrganizationType(type);

  /* -------------------- Derived Values -------------------- */
  const avatarInitial = useMemo(
    () => organizationData.name?.[0]?.toUpperCase() ?? "?",
    [organizationData.name],
  );

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      organizationId,
      status,
    }: {
      organizationId: string;
      status: OrganizationStatus;
    }) => updateOrganizationApi(type, organizationId, { status }),

    onSuccess: () => {
      message.success(`${label} status updated`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onClose();
    },

    onError: () => {
      message.error(`Failed to update ${label.toLowerCase()} status`);
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = String(organizationData.status).toUpperCase();
  const isActive = status === "ACTIVE";

  const getNextStatus = (): OrganizationStatus => {
    if (status === "PENDING") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE"
          ? `Activate ${label}?`
          : `Deactivate ${label}?`,
      content: `Are you sure you want to ${nextStatus} "${organizationData.name}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          organizationId: organizationData.id,
          status: nextStatus,
        }),
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <Drawer
      title={label}
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
            loading={isPendingMutation}
            disabled={isPendingMutation}
            className={`px-8 ${
              isActive
                ? "border-red-500 text-red-500"
                : "border-green-500 text-green-500"
            }`}
            onClick={handleStatusToggle}
          >
            {isActive ? "Deactivate" : "Activate"} {label}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {organizationData ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                size={48}
                className="bg-button-primary text-white rounded-full"
              >
                {avatarInitial}
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {organizationData.name || "N/A"}
                </h3>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm font-medium mt-1">
                  {organizationData.branchLocation || "N/A"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Created On</div>
                <div className="text-sm font-medium mt-1">
                  {organizationData.created_at
                    ? new Date(organizationData.created_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "N/A"}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default OrganizationViewDrawer;
