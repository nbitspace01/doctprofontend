import React, { useMemo } from "react";
import { App, Button, Drawer } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FormattedDate from "../../Common/FormattedDate";
import { updateDegreeApi } from "../../../api/degree.api";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
}

interface DegreeViewProps {
  open: boolean;
  onClose: () => void;
  degreeData: DegreeData;
}

type DegreeStatus = "pending" | "active" | "inactive";

const DegreeView: React.FC<DegreeViewProps> = ({
  open,
  onClose,
  degreeData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (degreeData.name) return degreeData.name;

    const fullName = `${degreeData.name || ""}`.trim();

    return fullName || "N/A";
  }, [degreeData]);

  const avatarInitial = useMemo(() => {
    if (degreeData.name) return degreeData.name[0].toUpperCase();
    if (degreeData.name) return degreeData.name[0].toUpperCase();
  }, [degreeData]);

  // const profileImage =
  //   degreeData.profile_image || degreeData.image_url || "";

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      degreeId,
      status,
    }: {
      degreeId: string;
      status: DegreeStatus;
    }) => updateDegreeApi(degreeId, { status }),

    onSuccess: () => {
      message.success("Degree status updated");
      queryClient.invalidateQueries({ queryKey: ["degree"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update degree status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = degreeData.status;

  const isPending = status === "pending";
  const isActive = status === "active";
  const isInactive = status === "inactive";

  const getNextStatus = (): DegreeStatus => {
    if (status === "pending") return "active";
    if (status === "active") return "inactive";
    return "active";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "active" ? "Activate Degree?" : "Deactivate Degree?",
      content: `Are you sure you want to ${nextStatus} "${degreeData.name}"?`,
      okType: nextStatus === "active" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          degreeId: degreeData.id,
          status: nextStatus,
        }),
    });
  };

  return (
    <Drawer
      title="Degree"
      placement="right"
      onClose={onClose}
      open={open}
      className="custom-drawer"
      width={400}
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
        <div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Degree Name</p>
            <p className="text-base">{degreeData?.name}</p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Specialization</p>
            <p className="text-base">{degreeData?.specialization}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Status</p>
            <p className="text-base">{degreeData?.status}</p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Created on</p>
            <p className="text-base">
              {degreeData?.created_at ? (
                <FormattedDate
                  dateString={degreeData.created_at}
                  format="long"
                />
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default DegreeView;
