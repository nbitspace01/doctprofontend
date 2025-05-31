import React from "react";
import { Drawer, Avatar, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface ViewProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  profileData: {
    name: string;
    role: string;
    title: string;
    note: string;
    email: string;
    phone: string;
  };
}

const ViewProfileDrawer: React.FC<ViewProfileDrawerProps> = ({
  visible,
  onClose,
  profileData,
}) => {
  return (
    <Drawer
      title="View Profile"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      closeIcon={<CloseOutlined className="text-gray-600" />}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar size={64} className="bg-button-primary">
            {profileData.name.charAt(0)}
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-1">Note</p>
            <p>{profileData.note}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Role</p>
            <p>{profileData.role}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Email Address</p>
            <p>{profileData.email}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Phone Number</p>
            <p>{profileData.phone}</p>
          </div>
        </div>

        <Button
          className="w-full bg-button-primary text-white py-2 px-4 rounded-md hover:!bg-button-primary transition-colors"
          onClick={() => {
            /* Handle edit profile */
          }}
        >
          Edit Profile
        </Button>
      </div>
    </Drawer>
  );
};

export default ViewProfileDrawer;
