import React from "react";
import { Drawer, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface SubAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  organization_type: string;
  status: string;
  active_user: boolean;
}

interface ViewSubAdminProps {
  open: boolean;
  onClose: () => void;
  subAdminData: SubAdminData;
}

const ViewSubAdmin: React.FC<ViewSubAdminProps> = ({
  open,
  onClose,
  subAdminData,
}) => {
  return (
    <Drawer
      title="Sub Admin"
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      className="custom-drawer"
    >
      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {subAdminData.first_name} {subAdminData.last_name}
            </h3>
            <p className="text-gray-600">{subAdminData.email}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{subAdminData.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <Tag color="green">{subAdminData.role}</Tag>
          </div>
        </div>

        {/* Organization Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Organisation Type</p>
            <p className="text-purple-600">{subAdminData.organization_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{subAdminData.location}</p>
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{subAdminData.status}</p>
        </div>

        {/* Active User */}
        <div>
          <p className="text-sm text-gray-500">Active User</p>
          <p className="font-medium">
            {subAdminData.active_user ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </Drawer>
  );
};

export default ViewSubAdmin;
