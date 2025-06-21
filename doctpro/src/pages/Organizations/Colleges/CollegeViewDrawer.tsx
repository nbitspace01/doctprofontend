import React from "react";
import { Drawer, Button, Tag, Avatar, Spin } from "antd";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { useCollegeById } from "../../../api/college";

interface CollegeViewDrawerProps {
  open: boolean;
  onClose: () => void;
  setOpen: (open: boolean) => void;
  collegeId: string;
}

const CollegeViewDrawer: React.FC<CollegeViewDrawerProps> = ({
  open,
  onClose,
  setOpen,
  collegeId,
}) => {
  const { data: college, isLoading, error } = useCollegeById(collegeId);

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">College Management</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={<CloseOutlined />}
      width={600}
      bodyStyle={{ padding: 0 }}
      footer={
        <div className="flex justify-between items-center mt-auto">
          <Button
            className="bg-gray-200 text-gray-700 px-8"
            size="large"
            onClick={() => setOpen(false)}
          >
            Back
          </Button>
          <Button
            type="default"
            className="border-blue-500 text-blue-500 px-8"
            size="large"
          >
            {college.status === "Active" ? "Deactivate" : "Activate"} Account
          </Button>
        </div>
      }
    >
      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">
            Error loading college data: {error.message}
          </div>
        ) : college ? (
          <>
            <div className="flex items-center gap-4 mb-8">
              <Avatar size={48} icon={<UserOutlined />} />
              <span className="font-semibold text-lg">
                {college.name || "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
              <div>
                <div className="text-xs text-gray-500">Location:</div>
                <div className="text-sm">
                  {college.city && college.state
                    ? `${college.city}, ${college.state}`
                    : college.city || college.state || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm">{college.email || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm">{college.phone || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Website</div>
                <div className="text-sm">{college.website_url || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created on</div>
                <div className="text-sm">
                  {college.created_at
                    ? new Date(college.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Tag
                  color={
                    college.status === "Active"
                      ? "green"
                      : college.status === "Pending"
                      ? "orange"
                      : "red"
                  }
                  className="mt-1"
                >
                  {college.status || "Pending"}
                </Tag>
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
