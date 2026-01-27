import React, { useMemo } from "react";
import { Drawer, Button, Avatar, App, Image } from "antd";
import StatusBadge from "../../Common/StatusBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCollegeApi } from "../../../api/college.api";

/* ---------- TYPES ---------- */
export interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  name: string;
  state: string;
  district: string;
  hospitals: any[];
  created_at: string;
  status: "active" | "pending" | "inactive";
}

interface CollegeViewDrawerProps {
  open: boolean;
  onClose: () => void;
  collegeData: CollegeData;
}

type CollegeStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const CollegeViewDrawer: React.FC<CollegeViewDrawerProps> = ({
  open,
  onClose,
  collegeData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (collegeData.name) return collegeData.name;

    const fullName = `${collegeData.name || ""}`.trim();

    return fullName || "N/A";
  }, [collegeData]);

  const avatarInitial = useMemo(() => {
    return collegeData.name?.[0]?.toUpperCase() ?? "?";
  }, [collegeData.name]);

  const profileImage = collegeData.logo || "";

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      collegeId,
      status,
    }: {
      collegeId: string;
      status: CollegeStatus;
    }) => updateCollegeApi(collegeId, { status }),

    onSuccess: () => {
      message.success("college status updated");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update college status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = collegeData.status;

  // const isPending = status === "PENDING";
  const isActive = status === "ACTIVE";
  // const isInactive = status === "INACTIVE";

  const getNextStatus = (): CollegeStatus => {
    if (status === "PENDING") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE" ? "Activate College?" : "Deactivate College?",
      content: `Are you sure you want to ${nextStatus} "${collegeData.name}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          collegeId: collegeData.id,
          status: nextStatus,
        }),
    });
  };

  return (
    <Drawer
      title="College"
      placement="right"
      open={open}
      onClose={onClose}
      width={600}
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
            {isActive ? "Deactivate" : "Activate"} College
          </Button>
        </div>
      }
    >
      <div className="">
        {collegeData ? (
          <>
            <div className="flex items-center gap-4 mb-8">
              {collegeData.logo ? (
                <Image
                  src={profileImage}
                  width={40}
                  height={40}
                  alt="College"
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
              <div>
                <div className="text-xs text-gray-500">State</div>
                <div className="text-sm">{collegeData.state || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">District</div>
                <div className="text-sm">{collegeData.district || "N/A"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500">Associated Colleges</div>
                <div className="text-sm">
                  {collegeData.hospitals && collegeData.hospitals.length > 0
                    ? collegeData.hospitals
                        .map((hospital: any) => hospital.name)
                        .join(", ")
                    : "No hospitals associated"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created on</div>
                <div className="text-sm">
                  {collegeData.created_at
                    ? new Date(collegeData.created_at).toLocaleDateString(
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
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <StatusBadge status={collegeData.status.toUpperCase() || "PENDING"} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">No college data found</div>
        )}
      </div>
    </Drawer>
  );
};

export default CollegeViewDrawer;
