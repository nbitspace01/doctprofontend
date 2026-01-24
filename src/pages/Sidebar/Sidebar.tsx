import React from "react";
import { Layout } from "antd";
import { useNavigate } from "@tanstack/react-router";
import {
  Building,
  Building2,
  Briefcase,
  FileText,
  House,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  ShieldUser,
  UserRoundCog,
} from "lucide-react";
import { getUserInfo } from "../Common/authUtils";

const { Sider } = Layout;

/* -------------------- Types -------------------- */
type SubMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

type MenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  subMenu?: SubMenuItem[];
};

/* -------------------- Constants -------------------- */
const STORAGE_KEYS = {
  selectedItem: "selectedItem",
  expandedMenus: "expandedMenus",
  selectedSubMenu: "selectedSubMenu",
};

/* -------------------- Component -------------------- */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { roleName } = getUserInfo();

  /* -------------------- State -------------------- */
  const [selectedItem, setSelectedItem] = React.useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.selectedItem) ?? "",
  );

  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.expandedMenus) ?? "[]"),
  );

  const [selectedSubMenu, setSelectedSubMenu] = React.useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.selectedSubMenu) ?? "",
  );

  /* -------------------- Persist State -------------------- */
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selectedItem, selectedItem);
    localStorage.setItem(
      STORAGE_KEYS.expandedMenus,
      JSON.stringify(expandedMenus),
    );
    localStorage.setItem(STORAGE_KEYS.selectedSubMenu, selectedSubMenu);
  }, [selectedItem, expandedMenus, selectedSubMenu]);

  /* -------------------- Helpers -------------------- */
  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? [] : [menuId]));
  };

  const handleLogout = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.clear();
    navigate({ to: "/auth/login" });
  };

  /* -------------------- Menu Config -------------------- */
  const allMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label:
        roleName === "admin"
          ? "Super Admin Dashboard"
          : roleName === "subadmin"
            ? "Sub Admin Dashboard"
            : roleName === "hospitaladmin"
              ? "Hospital Admin Dashboard"
              : "Dashboard", // fallback

      icon: <House />,
      onClick: () => {
        setSelectedItem("dashboard");
        setExpandedMenus([]);
        navigate({ to: "/app/dashboard" });
      },
    },
    // {
    //   id: "hospital-dashboard",
    //   label: "Hospital Dashboard",
    //   icon: <Building2 />,
    //   onClick: () => {
    //     setSelectedItem("hospital-dashboard");
    //     setExpandedMenus([]);
    //     navigate({ to: "/app/hospital/dashboard" });
    //   },
    // },
    {
      id: "sub-admin",
      label: "Sub-Admin List",
      icon: <ShieldUser />,
      onClick: () => {
        setSelectedItem("sub-admin");
        setExpandedMenus([]);
        navigate({ to: "/app/subadmin" });
      },
    },
    {
      id: "hospital-admin",
      label: "Hospital Admin List",
      icon: <ShieldUser />,
      onClick: () => {
        setSelectedItem("hospital-admin");
        setExpandedMenus([]);
        navigate({ to: "/app/hospital-admin" });
      },
    },
    // {
    //   id: "sub-admin-dashboard",
    //   label: "Sub-Admin Dashboard",
    //   icon: <LayoutDashboard />,
    //   onClick: () => {
    //     setSelectedItem("sub-admin-dashboard");
    //     setExpandedMenus([]);
    //     navigate({ to: "/app/subadmin/dashboard" });
    //   },
    // },
    {
      id: "masters",
      label: "Master List",
      icon: <Building2 />,
      onClick: () => {
        setSelectedItem("masters");
        toggleSubmenu("masters");
      },
      subMenu: [
        {
          id: "hospitals",
          label: "Hospital & Clinics List",
          onClick: () => {
            setSelectedItem("masters");
            setSelectedSubMenu("hospitals");
            setExpandedMenus(["masters"]);
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
        setSelectedItem("organizations");
        toggleSubmenu("organizations");
      },
      subMenu: [
        {
          id: "clinics",
          label: "Hospitals",
          onClick: () => {
            setSelectedItem("organizations");
            setSelectedSubMenu("clinics");
            setExpandedMenus(["organizations"]);
            navigate({ to: "/app/clinics" });
          },
        },
        // {
        //   id: "colleges",
        //   label: "Colleges",
        //   onClick: () => {
        //     setSelectedSubMenu("colleges");
        //     navigate({ to: "/app/colleges/list" });
        //   },
        // },
      ],
    },
    {
      id: "people",
      label: "People Management",
      icon: <Building />,
      onClick: () => {
        setSelectedItem("people");
        toggleSubmenu("people");
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
      id: "job-post",
      label: "Job post Management",
      icon: <Briefcase />,
      onClick: () => {
        setSelectedItem("job-post");
        setExpandedMenus([]);
        navigate({ to: "/app/job-post" });
      },
    },
    {
      id: "ad-management",
      label: "Ads Management",
      icon: <FileText />,
      onClick: () => {
        setSelectedItem("ad-management");
        toggleSubmenu("ad-management");
      },
      subMenu: [
        {
          id: "adspostlist",
          label: "Ads Post List",
          onClick: () => {
            setSelectedSubMenu("adspostlist");
            navigate({ to: "/app/ads" });
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
        toggleSubmenu("kyc");
        navigate({ to: "/app/kyc" });
      },
    },
  ];

  /* -------------------- Role Filter (UNCHANGED LOGIC) -------------------- */
  const menuItems =
    roleName === "hospitaladmin"
      ? allMenuItems.filter((i) =>
          ["dashboard", "job-post"].includes(i.id),
        )
      : roleName === "subadmin"
        ? allMenuItems.filter((i) =>
            ["dashboard", "organizations", "ad-management", "kyc"].includes(
              i.id,
            ),
          )
        : roleName === "admin"
          ? allMenuItems.filter((i) =>
              [
                "dashboard",
                "sub-admin",
                "masters",
                "organizations",
                "people",
                "ad-management",
                "job-post",
                "kyc",
              ].includes(i.id),
            )
          : [];

  /* -------------------- Render -------------------- */
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
                className={
                  selectedItem === item.id ? "text-white" : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              <span className="ml-3">{item.label}</span>
            </div>

            {item.subMenu && expandedMenus.includes(item.id) && (
              <div className="ml-8">
                {item.subMenu.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center h-[40px] mb-2 text-base px-4 cursor-pointer rounded-md transition-colors duration-200 ${
                      selectedSubMenu === sub.id
                        ? "bg-[#f7f7f7] text-[#6aa4f0]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={sub.onClick}
                  >
                    <span className="ml-3">{sub.label}</span>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="fixed bottom-5">
          <div
            className="flex items-center h-[60px] text-base text-gray-500 hover:bg-gray-100 px-4 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut />
            <span className="ml-3">Logout</span>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
