import { useNavigate } from "@tanstack/react-router";
import { Layout } from "antd";
import {
  Building,
  Building2,
  House,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  ShieldUser,
  UserRoundCog,
} from "lucide-react";
import React from "react";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = React.useState<string>("dashboard");
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);
  const [selectedSubMenu, setSelectedSubMenu] = React.useState<string>("");
  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: "/auth/login" });
  };

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
    {
      id: "masters",
      label: "Master List",
      icon: <Building2 />,
      onClick: () => {
        toggleSubmenu("masters");
        setSelectedItem("masters");
      },
      subMenu: [
        {
          id: "hospitals",
          label: "Hospital & Clinics List",
          onClick: () => {
            setSelectedSubMenu("hospitals");
            navigate({ to: "/app/hospitals" });
          },
        },
        {
          id: "colleges",
          label: "Colleges",
          onClick: () => {
            setSelectedSubMenu("colleges");
            navigate({ to: "/app/colleges" });
          },
        },
        {
          id: "degree-specialization",
          label: "Degree Specialization",
          onClick: () => {
            setSelectedSubMenu("degree-specialization");
            navigate({ to: "/app/degree-specialization" });
          },
        },
      ],
    },
    {
      id: "organizations",
      label: "Organizations",
      icon: <Building2 />,
      onClick: () => {
        toggleSubmenu("organizations");
        setSelectedItem("organizations");
      },
      subMenu: [
        {
          id: "clinics",
          label: "Clinics",
          icon: <Building2 />,
          onClick: () => {
            setSelectedSubMenu("clinics");
            navigate({ to: "/app/clinics" });
          },
        },
      ],
    },
    {
      id: "people",
      label: "People Management",
      icon: <Building />,
      onClick: () => {
        toggleSubmenu("people");
        setSelectedItem("people");
      },
      subMenu: [
        {
          id: "students",
          label: "Students",
          onClick: () => {
            setSelectedSubMenu("students");
            navigate({ to: "/app/students" });
          },
        },
        {
          id: "healthcare",
          label: "Healthcare Professionals",
          onClick: () => {
            setSelectedSubMenu("healthcare");
            navigate({ to: "/app/healthcare" });
          },
        },
      ],
    },
    {
      id: "kyc",
      label: "KYC Management",
      icon: <UserRoundCog />,
      onClick: () => {
        setSelectedItem("kyc");
        navigate({ to: "/app/subadmin" });
      },
    },
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
      className="h-screen bg-white fixed top-20 left-0 overflow-hidden"
      theme="light"
    >
      <div className="mt-8 text-md h-[calc(100vh-80px)] overflow-y-auto">
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <div
              className={`flex items-center h-[60px] mb-3 text-base px-4 cursor-pointer rounded-md transition-colors duration-200 ${
                selectedItem === item.id
                  ? "bg-button-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={item.onClick}
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
            {item.subMenu && expandedMenus.includes(item.id) && (
              <div className="ml-8">
                {item.subMenu.map((subItem) => (
                  <div
                    key={subItem.id}
                    className={`flex items-center h-[40px] mb-2 text-base px-4 cursor-pointer rounded-md transition-colors duration-200 ${
                      selectedSubMenu === subItem.id
                        ? "bg-[#f7f7f7] text-[#6aa4f0]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={subItem.onClick}
                  >
                    <span className="ml-3">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Logout button fixed at the bottom */}
        <div className="sticky bottom-5 py-3 w-full left-0 border-t border-gray-200 bg-white">
          <div
            className="flex items-center h-[60px] text-base text-gray-500 hover:bg-gray-100 px-4 cursor-pointer"
            onClick={() => handleLogout()}
          >
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
