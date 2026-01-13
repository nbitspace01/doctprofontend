import React from "react";
import { Avatar, Drawer, Image, Tag } from "antd";

interface SubAdminData {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  role: string;
  location?: string;
  organization_type: string;
  status: string;
  active_user: boolean;
  profile_image?: string;
  image_url?: string;
  state?: string;
  district?: string;
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
  // Determine title based on role or data presence
  const drawerTitle = subAdminData.role?.toLowerCase().includes("hospital") 
    ? "Hospital Admin" 
    : "Sub Admin";

  // Get display name - handle both name (single field) and first_name/last_name (separate fields)
  const getDisplayName = () => {
    if (subAdminData.name) {
      return subAdminData.name;
    }
    const firstName = subAdminData.first_name || "";
    const lastName = subAdminData.last_name || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  // Get avatar initial
  const getAvatarInitial = () => {
    if (subAdminData.name) {
      return subAdminData.name.charAt(0).toUpperCase();
    }
    if (subAdminData.first_name) {
      return subAdminData.first_name.charAt(0).toUpperCase();
    }
    if (subAdminData.email) {
      return subAdminData.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  // Get profile image - check both profile_image and image_url
  const profileImage = subAdminData.profile_image || subAdminData.image_url || "";

  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      className="custom-drawer"
    >
      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          {profileImage ? (
            <Image
              src={profileImage}
              width={40}
              height={40}
              alt="Sub Admin"
              className="rounded-full"
            />
          ) : (
            <Avatar
              size={40}
              className="bg-button-primary rounded-full mr-2 text-white"
            >
              {getAvatarInitial()}
            </Avatar>
          )}
          <div>
            <h3 className="text-lg font-semibold">
              {getDisplayName()}
            </h3>
            <p className="text-gray-600">{subAdminData.email || "N/A"}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-medium">{subAdminData.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <Tag color="green">{subAdminData.role || "N/A"}</Tag>
          </div>
        </div>

        {/* Organization Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Organisation Type</p>
            <p className="text-purple-600">{subAdminData.organization_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium">{subAdminData.state || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">District</p>
            <p className="font-medium">{subAdminData.district || "N/A"}</p>
          </div>
          {subAdminData.location && (
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{subAdminData.location}</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{subAdminData.status || "N/A"}</p>
        </div>

        {/* Active User */}
        <div>
          <p className="text-sm text-gray-500">Active User</p>
          <p className="font-medium">
            {subAdminData.active_user !== undefined ? (subAdminData.active_user ? "Yes" : "No") : "N/A"}
          </p>
        </div>
      </div>
    </Drawer>
  );
};

export default ViewSubAdmin;
