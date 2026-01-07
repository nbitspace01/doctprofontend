import { SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Dropdown, Input } from "antd";
import React, { useState } from "react";
import axiosInstance from "../Common/axiosInstance";
import { EditIcon, ViewIcon } from "../Common/SVG/svg.functions";
import EditProfileDrawer from "./EditProfileDrawer";
import ViewProfileDrawer from "./ViewProfileDrawer";
import { searchEntities } from "../../api/searchentities";
// Add this interface for type safety
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  userType: string;
  status: string;
  kyc_verified: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  recommendationCount: number;
  gender: string;
  dob: string;
  location: string;
  degree: string;
  specialization: string;
  college: string;
  startYear: number;
  endYear: number;
  idCardUrl: string | null;
  course: string | null;
  type: string;
  note: string | null;
}

const Header: React.FC = () => {
  const [viewProfileDrawerVisible, setViewProfileDrawerVisible] =
    useState(false);
  const [editProfileDrawerVisible, setEditProfileDrawerVisible] =
    useState(false);
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const USER_ID = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const roleName = localStorage.getItem("roleName");
  const userEmail = localStorage.getItem("userEmail");

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile", USER_ID],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${URL}/api/user/profile/${USER_ID}`
      );
      return response.data;
    },
    enabled: !!USER_ID,
  });

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

  // Replace the hardcoded profileData with the fetched data
  const displayName = userProfile?.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "");
  const displayRole = userProfile?.role || (roleName ? roleName.charAt(0).toUpperCase() + roleName.slice(1) : "");
  const displayEmail = userProfile?.email || userEmail || "";
  const displayPhone = userProfile?.phone || "";
  
  const profileData = {
    name: displayName || "Loading...",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: displayRole || "Loading...",
    title:
      userProfile?.type === "Doctor"
        ? `Dr. ${displayName}`
        : displayName || "Loading...",
    note: userProfile?.note ?? "",
    email: displayEmail,
    phone: displayPhone,
  };

  const searchMutation = useMutation({
    mutationFn: (keyword: string) => searchEntities({ keyword }),
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchMutation.mutate(e.currentTarget.value);
    }
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
              onPressEnter={handleSearch}
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            {/* <Badge count={5} className="cursor-pointer">
              <BellOutlined className="text-xl text-gray-600 hover:text-blue-600" />
            </Badge> */}

            {/* User Profile */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center space-x-3 cursor-pointer">
                <Avatar size={32} className="bg-button-primary">
                  {userProfile?.name?.charAt(0) || firstName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <span className="font-medium text-gray-700">
                  {userProfile?.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "Loading...")}
                </span>
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
        initialValues={{
          fullName: displayName || "",
          email: displayEmail || "",
          note: userProfile?.note ?? "",
          phoneNumber: displayPhone || "",
          role: displayRole || "",
        }}
      />
    </>
  );
};

export default Header;
