import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Typography } from "antd";
import axios from "axios";
import React from "react";

interface AdsDetailResponse {
  id: string;
  title: string;
  companyName: string;
  hospitalName: string;
  adType: string;
  displayLocation: string;
  targetAudience: {
    role: string;
    country: string;
    state: string;
  };
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  redirectUrl: string;
  status: string;
  rejectionReason: string | null;
}

const fetchAdsDetail = async (id: string): Promise<AdsDetailResponse> => {
  const { data } = await axios.get(`http://localhost:3000/api/ads/${id}`);
  return data;
};

interface AdsPostViewDrawerProps {
  visible: boolean;
  onClose: () => void;
  adsId: string;
}

const AdsPostViewDrawer: React.FC<AdsPostViewDrawerProps> = ({
  visible,
  onClose,
  adsId,
}) => {
  const { data: adsData, isLoading } = useQuery({
    queryKey: ["adsDetail", adsId],
    queryFn: () => fetchAdsDetail(adsId),
    enabled: visible && !!adsId,
  });

  // Update the destructured properties
  const {
    title = "",
    companyName = "",
    hospitalName = "",
    adType = "",
    displayLocation = "",
    startDate = "",
    endDate = "",
    targetAudience = {
      role: "",
      country: "",
      state: "",
    },
    description = "",
  } = adsData || {};

  if (isLoading) {
    return (
      <Drawer
        visible={visible}
        onClose={onClose}
        width={400}
        closeIcon={<CloseOutlined />}
        title="Ads Post"
        className="p-0"
      >
        <div className="flex justify-center items-center h-full">
          Loading...
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      width={400}
      closeIcon={<CloseOutlined />}
      title="Ads Post"
      className="p-0"
    >
      <div className="flex flex-col h-full">
        {/* Basic Info Section */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography.Text className="text-gray-500">Title</Typography.Text>
              <Typography.Text className="block font-medium">
                {title}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Company Name
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {companyName}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Hospital Name
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {hospitalName}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Ad Type
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {adType}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Display Location
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {displayLocation}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Start Date
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {startDate}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                End Date
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {endDate}
              </Typography.Text>
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="p-4">
          <Typography.Title level={5}>Target Audience</Typography.Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography.Text className="text-gray-500">Role</Typography.Text>
              <Typography.Text className="block font-medium">
                {targetAudience.role}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">State</Typography.Text>
              <Typography.Text className="block font-medium">
                {targetAudience.state}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text className="text-gray-500">
                Country
              </Typography.Text>
              <Typography.Text className="block font-medium">
                {targetAudience.country}
              </Typography.Text>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4">
          <Typography.Title level={5}>Description</Typography.Title>
          <Typography.Text className="block font-medium">
            {description}
          </Typography.Text>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto p-4 flex gap-4">
          <Button className="flex-1">Reject</Button>
          <Button className="flex-1" type="primary">
            Approve
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default AdsPostViewDrawer;
