import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Input } from "antd";
import React from "react";

const Header: React.FC = () => {
  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
    },
  ];

  return (
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
  );
};

export default Header;
