import React from "react";
import { Drawer } from "antd";
import { CloseOutlined } from "@ant-design/icons";
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

  return (
    <Drawer
      title="Degree & Specialisation"
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={<CloseOutlined />}
      extra={false}
      width={400}
    >
      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Degree Name</p>
            <p className="text-base">{degreeData?.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-500 mb-1">Level</p>
            <p className="text-base">{degreeData?.graduation_level}</p>
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
                <FormattedDate dateString={degreeData.created_at} format="long" />
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
