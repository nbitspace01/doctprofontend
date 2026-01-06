import { useNavigate } from "@tanstack/react-router";
import { Layout } from "antd";
import {
  Building,
  Building2,
  Briefcase,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  ShieldUser,
  UserRoundCog,
} from "lucide-react";
import React from "react";
import { getUserInfo } from "../Common/authUtils";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = React.useState<string>(
    () => localStorage.getItem("selectedItem") ?? ""
  );
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(() =>
    JSON.parse(localStorage.getItem("expandedMenus") ?? "[]")
  );
  const [selectedSubMenu, setSelectedSubMenu] = React.useState<string>(
    () => localStorage.getItem("selectedSubMenu") ?? ""
  );
  
  const userInfo = getUserInfo();
  const roleName = userInfo.roleName;

  React.useEffect(() => {
    localStorage.setItem("selectedItem", selectedItem);
    localStorage.setItem("expandedMenus", JSON.stringify(expandedMenus));
    localStorage.setItem("selectedSubMenu", selectedSubMenu);
  }, [selectedItem, expandedMenus, selectedSubMenu]);

  React.useEffect(() => {
    const currentPath = window.location.pathname;

    allMenuItems.forEach((item) => {
      if (item.subMenu) {
        item.subMenu.forEach((subItem) => {
          if (currentPath.includes(subItem.id)) {
            setSelectedItem(item.id);
            setSelectedSubMenu(subItem.id);
            setExpandedMenus((prev) => [...prev, item.id]);
          }
        });
      } else if (currentPath.includes(item.id) || (item.id === "hospital-dashboard" && currentPath.includes("hospital/dashboard")) || (item.id === "job-post" && currentPath.includes("job-post")) || (item.id === "hospital-admin" && currentPath.includes("hospital-admin"))) {
        setSelectedItem(item.id);
      }
    });
  }, []);

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? [] : [menuId]));
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedItem");
    localStorage.removeItem("expandedMenus");
    localStorage.removeItem("selectedSubMenu");
    localStorage.clear();
    navigate({ to: "/auth/login" });
  };

  const allMenuItems = [
    {
      id: "dashboard",
      label: "Super admin Dashboard",
      icon: <House />,
      className: "text-white",
      onClick: () => {
        setSelectedItem("dashboard");
        setExpandedMenus([]);
        navigate({ to: "/app/dashboard" });
      },
    },
    {
      id: "hospital-dashboard",
      label: "Hospital Dashboard",
      icon: <Building2 />,
      onClick: () => {
        setSelectedItem("hospital-dashboard");
        setExpandedMenus([]);
        navigate({ to: "/app/hospital/dashboard" });
      },
    },
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
    {
      id: "sub-admin-dashboard",
      label: "Sub-Admin Dashboard",
      icon: <LayoutDashboard />,
      onClick: () => {
        setSelectedItem("sub-admin-dashboard");
        setExpandedMenus([]);
        navigate({ to: "/app/subadmin/dashboard" });
      },
    },
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
          label: "Clinics",
          icon: <Building2 />,
          onClick: () => {
            setSelectedItem("organizations");
            setSelectedSubMenu("clinics");
            setExpandedMenus(["organizations"]);
            navigate({ to: "/app/clinics" });
          },
        },
        {
          id: "colleges",
          label: "Colleges",
          onClick: () => {
            setSelectedSubMenu("colleges");
            navigate({ to: "/app/colleges/list" });
          },
        },
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
        // {
        //   id: "campaign",
        //   label: "Campaign",
        //   onClick: () => {
        //     setSelectedSubMenu("campaign");
        //     navigate({ to: "/app/campaign" });
        //   },
        // },
      ],
    },
    // {
    //   id: "job-post",
    //   label: "Job post Management",
    //   icon: <Briefcase />,
    //   onClick: () => {
    //     setSelectedItem("job-post");
    //     setExpandedMenus([]);
    //     navigate({ to: "/app/job-post" });
    //   },
    // },
    // {
    //   id: "ad-management",
    //   label: "Ads Management",
    //   icon: <FileText />,
    //   onClick: () => {
    //     toggleSubmenu("ad-management");
    //     setSelectedItem("ad-management");
    //   },
    //   subMenu: [
    //     {
    //       id: "adspostlist",
    //       label: "Ads Post List",
    //       onClick: () => {
    //         setSelectedSubMenu("adspostlist");
    //         navigate({ to: "/app/ads" });
    //       },
    //     },
    //   ],
    // },
    // {
    //   id: "kyc",
    //   label: "KYC Management",
    //   icon: <UserRoundCog />,
    //   onClick: () => {
    //     setSelectedItem("kyc");
    //     setExpandedMenus((prev) => (prev.includes("kyc") ? [] : ["kyc"]));
    //     navigate({ to: "/app/kyc" });
    //   },
    // },
    // { id: "settings", label: "Settings", icon: <Settings /> },
    // { id: "help", label: "Help & Support", icon: <MessageCircleQuestion /> },
    // {
    //   id: "roles",
    //   label: "Roles & Permission",
    //   icon: <ShieldCheck />,
    // },
  ];

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (roleName === "hospital") {
      // Hospital admin sees only: Hospital Dashboard, Job Post Management, and Healthcare Professionals
      const hospitalDashboard = allMenuItems.find((item) => item.id === "hospital-dashboard");
      const jobPost = allMenuItems.find((item) => item.id === "job-post");
      const peopleMenu = allMenuItems.find((item) => item.id === "people");
      const healthcareSubItem = peopleMenu && "subMenu" in peopleMenu 
        ? peopleMenu.subMenu?.find((subItem: any) => subItem.id === "healthcare")
        : null;
      
      // Create Healthcare Professionals as a direct menu item
      const healthcareMenuItem = healthcareSubItem ? {
        id: "healthcare",
        label: "Healthcare Professionals",
        icon: <Building />,
        onClick: () => {
          setSelectedItem("healthcare");
          setExpandedMenus([]);
          navigate({ to: "/app/healthcare" });
        },
      } : null;

      // Return filtered menu items
      const filteredItems: any[] = [];
      if (hospitalDashboard) filteredItems.push(hospitalDashboard);
      if (jobPost) filteredItems.push(jobPost);
      if (healthcareMenuItem) filteredItems.push(healthcareMenuItem);
      
      return filteredItems;
    } else if (roleName === "subadmin") {
      // Subadmin sees: Sub-Admin Dashboard, Sub-Admin List, and Healthcare Professionals
      const subAdminDashboard = allMenuItems.find((item) => item.id === "sub-admin-dashboard");
      const subAdminList = allMenuItems.find((item) => item.id === "sub-admin");
      const peopleMenu = allMenuItems.find((item) => item.id === "people");
      const healthcareSubItem = peopleMenu && "subMenu" in peopleMenu 
        ? peopleMenu.subMenu?.find((subItem: any) => subItem.id === "healthcare")
        : null;
      
      // Create Healthcare Professionals as a direct menu item
      const healthcareMenuItem = healthcareSubItem ? {
        id: "healthcare",
        label: "Healthcare Professionals",
        icon: <Building />,
        onClick: () => {
          setSelectedItem("healthcare");
          setExpandedMenus([]);
          navigate({ to: "/app/healthcare" });
        },
      } : null;

      // Return filtered menu items
      const filteredItems: any[] = [];
      if (subAdminDashboard) filteredItems.push(subAdminDashboard);
      if (subAdminList) filteredItems.push(subAdminList);
      if (healthcareMenuItem) filteredItems.push(healthcareMenuItem);
      
      return filteredItems;
    }
    // Super admin (admin) sees all menu items
    return allMenuItems;
  };

  const menuItems = getFilteredMenuItems();

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
                {item.subMenu.map((subItem: any) => (
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
