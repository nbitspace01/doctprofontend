import { useNavigate } from "@tanstack/react-router";
import { Layout } from "antd";
import { Building2, House, LogOut, MessageCircleQuestion, Settings, ShieldCheck, ShieldUser } from "lucide-react";
import React from "react";


const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate =  useNavigate()
  const [selectedItem, setSelectedItem] = React.useState<string>("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <House />,
      className: "text-white",
      onClick: () => {
        setSelectedItem("dashboard");
        navigate({ to: "/app/dashboard" });
      },
    },
    {
      id: "sub-admin",
      label: "Sub-Admin List",
      icon: <ShieldUser />,
      onClick: () => {
        setSelectedItem("sub-admin");
        navigate({ to: "/app/subadmin" });
      },
    },
    { id: "organization", label: "Organization", icon: <Building2 /> },
    { id: "settings", label: "Settings", icon: <Settings /> },
    { id: "help", label: "Help & Support", icon: <MessageCircleQuestion /> },
    {
      id: "roles",
      label: "Roles & Permission",
      icon: <ShieldCheck />,
    },
  ];

  return (
    <Sider
      width={200}
      className="h-screen bg-white fixed top-20 left-0"
      theme="light"
    >
      <div className="mt-8 text-md min-h-screen">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center h-[60px] mb-3 text-base px-4 cursor-pointer rounded-md transition-colors duration-200 ${
              selectedItem === item.id
                ? "bg-[#1f479d] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => {
              item.onClick && item.onClick();
              setSelectedItem(item.id);
            }}
          >
            <span
              className={`${
                selectedItem === item.id ? "text-white" : "text-gray-500"
              }`}
            >
              {item.icon}
            </span>
            <span className="ml-3">{item.label}</span>
          </div>
        ))}

        {/* Logout button fixed at the bottom */}
        <div className="absolute bottom-20 w-full left-0 border-t border-gray-200">
          <div className="flex items-center h-[60px] text-base text-gray-500 hover:bg-gray-100 px-4 cursor-pointer">
            <span className="text-2xl text-gray-500">
              <LogOut />
            </span>
            <span className="ml-3">Logout</span>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
