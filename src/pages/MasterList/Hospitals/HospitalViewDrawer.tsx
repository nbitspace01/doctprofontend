import React, { useMemo } from "react";
import { Drawer, Button, Avatar, Spin, App, Image } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import StatusBadge from "../../Common/StatusBadge";
import { updateHospitalApi } from "../../../api/hospital.api";

interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  address: string | null;
  status: "active" | "inactive" | "pending";
  logoUrl: string | null;
  created_at: string;
  updated_at: string;
  updatedAt?: string;
  hospital_id: string | null;
}

interface HospitalViewDrawerProps {
  open: boolean;
  onClose: () => void;
  hospitalData: HospitalData;
}

type HospitalStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const HospitalViewDrawer: React.FC<HospitalViewDrawerProps> = ({
  open,
  onClose,
  hospitalData,
}) => {
  // const [modal, contextHolder] = Modal.useModal();
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (hospitalData.name) return hospitalData.name;

    const fullName = `${hospitalData.name || ""}`.trim();

    return fullName || "N/A";
  }, [hospitalData]);

  const avatarInitial = useMemo(() => {
    return hospitalData.name?.[0]?.toUpperCase() ?? "?";
  }, [hospitalData.name]);

  const profileImage = hospitalData.logoUrl || "";

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      hospitalId,
      status,
    }: {
      hospitalId: string;
      status: HospitalStatus;
    }) => updateHospitalApi(hospitalId, { status }),

    onSuccess: () => {
      message.success("Hospital status updated");
      queryClient.invalidateQueries({ queryKey: ["hospital"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update hospital status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = hospitalData.status.toUpperCase();

  // const isPending = status === "pending";
  const isActive = status === "ACTIVE";
  // const isInactive = status === "inactive";

  const getNextStatus = (): HospitalStatus => {
    if (status === "PENDING") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE" ? "Activate Hospital?" : "Deactivate Hospital?",
      content: `Are you sure you want to ${nextStatus} "${hospitalData.name}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          hospitalId: hospitalData.id,
          status: nextStatus,
        }),
    });
  };

  // -------------------- UI --------------------
  return (
    <Drawer
      title="Hospital"
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
            {isActive ? "Deactivate" : "Activate"} Hospital
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {hospitalData ? (
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
                <h3 className="text-xl font-semibold">{displayName}</h3>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              {/* Branch Location */}
              <div>
                <div className="text-xs text-gray-500">Branch Location</div>
                <div className="text-sm font-medium mt-1">
                  {hospitalData.branchLocation || "N/A"}
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <StatusBadge status={hospitalData.status.toUpperCase()} />
                </div>
              </div>

              {/* Created On */}
              <div>
                <div className="text-xs text-gray-500">Created On</div>
                <div className="text-sm font-medium mt-1">
                  {hospitalData.updated_at
                    ? new Date(hospitalData.updated_at).toLocaleDateString(
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

export default HospitalViewDrawer;
