import React from "react";
import { Drawer, Button, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface DegreeViewProps {
  open: boolean;
  onClose: () => void;
  degreeData?: {
    degreeName: string;
    specialization: string;
    level: string;
    status: string;
    createdDate: string;
  };
}

import { useQuery } from "@tanstack/react-query";
import FormattedDate from "../../Common/FormattedDate";

interface DegreeViewProps {
  open: boolean;
  onClose: () => void;
  degreeId: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

const fetchDegreeById = async (degreeId: string) => {
  const response = await fetch(`${API_URL}/api/degree/${degreeId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch degree data");
  }
  return response.json();
};

const DegreeView: React.FC<DegreeViewProps> = ({ open, onClose, degreeId }) => {
  const { data: degreeData, isLoading } = useQuery({
    queryKey: ["degree", degreeId],
    queryFn: () => fetchDegreeById(degreeId),
    enabled: !!degreeId && open,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Extract the status color logic
  let statusColor: string;
  if (degreeData?.status === "pending") {
    statusColor = "red";
  } else if (degreeData?.status === "active") {
    statusColor = "green";
  } else {
    statusColor = "default";
  }

  return (
    <Drawer
      title="Degree & Specialisation"
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={<CloseOutlined />}
      extra={false}
      width={400}
      footer={
        <div className="flex justify-end gap-3">
          <Button className="px-8" onClick={onClose}>
            Back
          </Button>
          <Button type="primary" danger className="px-8">
            Remove
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
          <div className="flex items-center">
            <p className="text-gray-500 mr-2 mt-3">Level</p>
            <Tag color="blue" className="font-normal ml-2 py-1">
              {degreeData?.graduation_level}
            </Tag>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Specialization</p>
            <p className="text-base">{degreeData?.specialization}</p>
          </div>
          <div className="flex items-center">
            <p className="text-gray-500 mr-3 mt-3">Status</p>
            <Tag color={statusColor} className="font-normal py-1">
              {degreeData?.status}
            </Tag>
          </div>
        </div>

        <div>
          <p className="text-gray-500 mb-1">Created on</p>
          <p className="text-base">
            {degreeData?.created_at ? (
              <FormattedDate dateString={degreeData.created_at} format="long" />
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>
    </Drawer>
  );
};

export default DegreeView;
