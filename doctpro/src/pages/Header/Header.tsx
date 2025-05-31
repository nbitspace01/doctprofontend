import { BellOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Input } from "antd";
import React, { useState } from "react";
import { EditIcon, ViewIcon } from "../Common/SVG/svg.functions";
import ViewProfileDrawer from "./ViewProfileDrawer";
import EditProfileDrawer from "./EditProfileDrawer";

const Header: React.FC = () => {
  const [viewProfileDrawerVisible, setViewProfileDrawerVisible] =
    useState(false);
  const [editProfileDrawerVisible, setEditProfileDrawerVisible] =
    useState(false);

  const userMenuItems = [
    {
      key: "view-profile",
      label: <span className="mx-2">View Profile</span>,
      icon: <ViewIcon />,
      onClick: () => {
        setViewProfileDrawerVisible(true);
      },
    },
    {
      key: "edit-profile",
      label: <span className="mx-2">Edit Profile</span>,
      icon: <EditIcon />,
      onClick: () => {
        setEditProfileDrawerVisible(true);
      },
    },
  ];

  const profileData = {
    name: "Surya",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Doctor",
    title: "Dr. Surya",
    note: "Cardiologist",
    email: "surya@gmail.com",
    phone: "9876543210",
    // Add other profile fields as needed
  };

  return (
    <>
      <header className="bg-white shadow-md w-full fixed top-0   py-2 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="p-3">
            <h1 className="text-[#1e3799] text-2xl font-bold">Doctpro</h1>
          </div>
          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <Input
              size="large"
              placeholder="Search..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg"
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <Badge count={5} className="cursor-pointer">
              <BellOutlined className="text-xl text-gray-600 hover:text-blue-600" />
            </Badge>

            {/* User Profile */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center space-x-3 cursor-pointer">
                <Avatar size="large" src="https://i.pravatar.cc/150?img=3" />
                <span className="font-medium text-gray-700">Surya</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </header>
      <ViewProfileDrawer
        visible={viewProfileDrawerVisible}
        onClose={() => setViewProfileDrawerVisible(false)}
        profileData={profileData}
      />
      <EditProfileDrawer
        visible={editProfileDrawerVisible}
        onClose={() => setEditProfileDrawerVisible(false)}
        onSave={() => {}}
      />
    </>
  );
};

export default Header;
