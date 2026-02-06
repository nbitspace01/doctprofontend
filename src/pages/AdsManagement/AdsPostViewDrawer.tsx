import { CloseOutlined } from "@ant-design/icons";
import {
  Button,
  Drawer,
  Typography,
  Spin,
  Image,
  Avatar,
  message,
  App,
} from "antd";
import React, { useEffect, useState } from "react";
import { AdsPostViewDrawerProps } from "./adsPostTypes";
import StatusBadge from "../Common/StatusBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveAdsPostAPI,
  rejectAdsPostAPI,
  statusAdsPostAPI,
} from "../../api/adsPost.api";
import { roleProps } from "../../App";

const AdsPostViewDrawer: React.FC<AdsPostViewDrawerProps> = ({
  open,
  onClose,
  adsData,
  role,
}) => {
  // ------------- Mutations ----------
  const queryClient = useQueryClient();

  const { modal, message } = App.useApp();
  const [currentRole, setCurrentRole] = useState<roleProps["role"] | null>(
    null,
  );

  useEffect(() => {
    const storedRole = localStorage.getItem("roleName") as roleProps["role"];
    setCurrentRole(storedRole);

    // remove old cached queries
    queryClient.removeQueries({ queryKey: ["adspost"] });
  }, []);

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      statusAdsPostAPI(id, { status: status }),
    onSuccess: (data: any) => {
      console.log("satatus", data)
      message.success(`Ad Status Updated Successfully`);
      queryClient.invalidateQueries({ queryKey: ["adspost"] });
      onClose();
    },
    onError: () => {
      message.error("Failed to change post status");
    },
  });

  // ----- Handle Function ------
  const handleStatusChange = (status: any) => {
    if (!adsData?.id) return;
    modal.confirm({
      title: "Confirm Changes",
      content: `Do You Want To ${status} This Job Post?`,
      okType: "danger",
      onOk: () => approveMutation.mutate(payload),
    });

    const payload = {
      id: adsData.id,
      status,
    };
  };

  if (!adsData) {
    return (
      <Drawer
        title="Ads Post"
        placement="right"
        open={open}
        onClose={onClose}
        width={600}
        closeIcon={<CloseOutlined />}
      >
        <div className="text-center text-gray-500">No data found</div>
      </Drawer>
    );
  }

  const avatarInitial = adsData.title?.[0] || "A";

  return (
    <Drawer
      title="Ads Post"
      placement="right"
      open={open}
      onClose={onClose}
      width={600}
      closeIcon={<CloseOutlined />}
      footer={
        currentRole === "admin" ? (
          <div className="flex justify-between items-center">
            <Button
              size="large"
              className="bg-gray-200 text-gray-700 px-8"
              onClick={onClose}
            >
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                disabled={adsData.status == "REJECTED"}
                loading={approveMutation.isPending}
                size="large"
                danger
                onClick={() => handleStatusChange("REJECTED")}
              >
                Reject
              </Button>
              <Button
                disabled={adsData.status == "ACTIVE"}
                loading={approveMutation.isPending}
                size="large"
                type="primary"
                onClick={() => handleStatusChange("APPROVED")}
              >
                Approve
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar size={40} className="bg-blue-500 text-white rounded-full">
            {avatarInitial}
          </Avatar>

          <h3 className="text-lg mt-2 font-semibold">{adsData.title}</h3>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
          <div>
            <div className="text-xs text-gray-500">Company Name</div>
            <div className="text-sm font-medium mt-1">{adsData.companyName || "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ad Type</div>
            <div className="text-sm font-medium mt-1">{adsData.adType}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Created By</div>
            <div className="text-sm font-medium mt-1">{adsData.createdByName || "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Display Location</div>
            <div className="text-sm font-medium mt-1">
              {adsData.displayLocation || (adsData as any).district || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Start Date</div>
            <div className="text-sm font-medium mt-1">{adsData.startDate}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">End Date</div>
            <div className="text-sm font-medium mt-1">{adsData.endDate}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">Status</div>
            <div className="text-sm">
              <StatusBadge status={adsData.status} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <div className="text-xs text-gray-500 mb-1">Description</div>
          <Typography.Text className="text-sm font-medium mt-1">
            {adsData.description}
          </Typography.Text>
        </div>

        {/* Ad Image Section */}
        {adsData.imageUrl && (
          <div className="mb-8">
            <div className="text-xs font-medium text-gray-500 mb-2">
              Ad Image
            </div>
            <Image
              src={adsData.imageUrl}
              alt="Ad Image"
              width="100%"
              style={{ borderRadius: "8px" }}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default AdsPostViewDrawer;
