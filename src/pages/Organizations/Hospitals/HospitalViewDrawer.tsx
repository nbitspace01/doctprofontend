import React from "react";
import { Drawer, Button, Avatar, Modal, message, Spin, App } from "antd";
import { CloseOutlined, HomeOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import StatusBadge from "../../Common/StatusBadge";
import {
  fetchHospitalByIdApi,
  updateHospitalApi,
} from "../../../api/hospital.api";

interface HospitalViewDrawerProps {
  open: boolean;
  onClose: () => void;
  hospitalId: string | null;
}

const HospitalViewDrawer: React.FC<HospitalViewDrawerProps> = ({
  open,
  onClose,
  hospitalId,
}) => {
  // const [modal, contextHolder] = Modal.useModal();
  const {modal, message} = App.useApp();
  const queryClient = useQueryClient();

  // -------------------- FETCH HOSPITAL BY ID --------------------
  const {
    data: hospital,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hospital", hospitalId],
    queryFn: () => fetchHospitalByIdApi(hospitalId!),
    enabled: !!hospitalId,
    refetchOnWindowFocus: false,

  });
  console.log("hospital data in drawer ", hospitalId, hospital);
  // -------------------- UPDATE STATUS MUTATION --------------------
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({
      hospitalId,
      status,
    }: {
      hospitalId: string;
      status: "active" | "inactive";
    }) => updateHospitalApi(hospitalId, { status }),

    onSuccess: async () => {
      message.success("Hospital status updated successfully");

      // 🔥 Refetch hospital data immediately
      await refetch();

      // 🔥 Update hospital list also
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },

    onError: () => {
      message.error("Failed to update hospital status");
    },
  });

  // -------------------- STATUS TOGGLE HANDLER --------------------
  const handleStatusToggle = () => {
    if (!hospital) return;

    const isActive = hospital.status === "active";
    const nextStatus = isActive ? "inactive" : "active";

    modal.confirm({
      title: isActive ? "Deactivate Hospital?" : "Activate Hospital?",
      content: `Are you sure you want to ${
        isActive ? "deactivate" : "activate"
      } "${hospital.name}" hospital?`,
      okText: "Yes",
      cancelText: "No",
      okType: isActive ? "danger" : "primary",
      onOk: () =>
        updateStatus({
          hospitalId: hospital.id,
          status: nextStatus,
        }),
    });
  };

  // -------------------- UI --------------------
  return (
    <Drawer
      title={<span className="font-bold text-xl">Hospital Management</span>}
      placement="right"
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      width={600}
      bodyStyle={{ padding: 0 }}
      footer={
        <div className="flex justify-between items-center">
          <Button
            className="bg-gray-200 text-gray-700 px-8"
            size="large"
            onClick={onClose}
          >
            Back
          </Button>

          {hospital && (
            <Button
              size="large"
              loading={isPending}
              className={`px-8 ${
                hospital.status === "active"
                  ? "border-red-500 text-red-500"
                  : "border-green-500 text-green-500"
              }`}
              onClick={handleStatusToggle}
            >
              {hospital.status === "active" ? "Deactivate" : "Activate"} Hospital
            </Button>
          )}
        </div>
      }
    >

      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : hospital ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              {hospital.logo ? (
                <img
                  src={hospital.logo}
                  alt={hospital.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <Avatar size={48} icon={<HomeOutlined />} />
              )}
              <span className="font-semibold text-lg">{hospital.name}</span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div className="col-span-2">
                <div className="text-xs text-gray-500">Branch Location</div>
                <div className="text-sm">
                  {hospital.branchLocation || "N/A"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-xs text-gray-500">Associated College</div>
                <div className="text-sm">
                  {hospital.college?.name || "No college associated"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Created On</div>
                <div className="text-sm">
                  {hospital.updatedAt
                    ? new Date(hospital.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">
                  <StatusBadge status={hospital.status} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            No hospital data found
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default HospitalViewDrawer;
