import React, { useMemo } from "react";
import { Drawer, Button, Avatar, Spin, App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import StatusBadge from "../../Common/StatusBadge";
import { updateClinicApi } from "../../../api/clinic.api";
import { ClinicData } from "./AddClinicModal";

interface ClinicViewDrawerProps {
  open: boolean;
  onClose: () => void;
  clinicData: ClinicData;
}

type ClinicStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const ClinicViewDrawer: React.FC<ClinicViewDrawerProps> = ({
  open,
  onClose,
  clinicData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const avatarInitial = useMemo(
    () => clinicData.name?.[0]?.toUpperCase() ?? "?",
    [clinicData.name],
  );

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      clinicId,
      status,
    }: {
      clinicId: string;
      status: ClinicStatus;
    }) => updateClinicApi(clinicId, { status }),

    onSuccess: () => {
      message.success("Clinic status updated");
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update clinic status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = String(clinicData.status).toUpperCase();
  const isActive = status === "ACTIVE";

  const getNextStatus = (): ClinicStatus => {
    if (status === "PENDING") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE" ? "Activate Clinic?" : "Deactivate Clinic?",
      content: `Are you sure you want to ${nextStatus} "${clinicData.name}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          clinicId: clinicData.id,
          status: nextStatus,
        }),
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <Drawer
      title="Clinic"
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
            {isActive ? "Deactivate" : "Activate"} Clinic
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {clinicData ? (
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
                  {clinicData.name || "N/A"}
                </h3>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm font-medium mt-1">
                  {clinicData.branchLocation || "N/A"}
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
                  {clinicData.created_at
                    ? new Date(clinicData.created_at).toLocaleDateString(
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

              {clinicData.submitter_phone ? (
                <div>
                  <div className="text-xs text-gray-500">
                    Submitted by (phone)
                  </div>
                  <div className="text-sm font-medium mt-1">
                    <a
                      href={`tel:${clinicData.submitter_phone}`}
                      className="text-blue-600"
                    >
                      {clinicData.submitter_phone}
                    </a>
                    <div className="text-[11px] text-gray-400">
                      Call to verify this is a real/original entry
                    </div>
                  </div>
                </div>
              ) : null}
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

export default ClinicViewDrawer;
