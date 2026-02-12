import { SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Dropdown, Input } from "antd";
import React, { useState } from "react";
import { fetchUserProfileApi } from "../../api/user.api";
import { EditIcon, ViewIcon } from "../Common/SVG/svg.functions";
import EditProfileDrawer from "./EditProfileDrawer";
import ViewProfileDrawer from "./ViewProfileDrawer";
import { searchEntities } from "../../api/searchentities.api";
import { ChevronDown } from "lucide-react";

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
  profile_picture?: string;
  logoUrl?: string | null;
  hr_full_name?: string | null;
  hr_phone?: string | null;
  website?: string | null;
}

const Header: React.FC = () => {
  const [viewProfileDrawerVisible, setViewProfileDrawerVisible] =
    useState(false);
  const [editProfileDrawerVisible, setEditProfileDrawerVisible] =
    useState(false);

  const USER_ID = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const roleName = localStorage.getItem("roleName");
  const userEmail = localStorage.getItem("userEmail");

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile", USER_ID],
    queryFn: async () => {
      const response = await fetchUserProfileApi(USER_ID!);
      return response;
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

  const displayName =
    userProfile?.name ||
    (firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "");
  const displayRole =
    userProfile?.role ||
    (roleName ? roleName.charAt(0).toUpperCase() + roleName.slice(1) : "");
  const displayEmail = userProfile?.email || userEmail || "";
  const displayPhone = userProfile?.phone || "";
  const normalizedRole = (userProfile?.role || roleName || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "");
  const isHospitalAdmin = normalizedRole === "hospitaladmin";
  const profileImage = isHospitalAdmin
    ? userProfile?.logoUrl || userProfile?.profile_picture
    : userProfile?.profile_picture;

  const profileData = {
    name: displayName || "Loading...",
    avatar: profileImage || "https://i.pravatar.cc/150?img=3",
    role: displayRole || "Loading...",
    title:
      userProfile?.type === "Doctor"
        ? `Dr. ${displayName}`
        : displayName || "Loading...",
    note: userProfile?.note ?? "",
    email: displayEmail,
    phone: displayPhone,
    hr_full_name: userProfile?.hr_full_name || "",
    hr_phone: userProfile?.hr_phone || "",
    website: userProfile?.website || "",
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
      <header className="bg-white shadow-md w-full fixed top-0 py-2 pl-2 pr-5">
        <div className="flex items-center justify-between">
          <div className="p-3">
            <h1 className="text-blue-900 text-2xl font-bold">Doctpro</h1>
          </div>
          <div className="flex-1 max-w-xl mx-8">
            <Input
              size="large"
              placeholder="Search..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg"
              onPressEnter={handleSearch}
            />
          </div>

          <div className="flex items-center space-x-6">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              {/* Rounded full background wrapper */}
              <div className="flex items-center space-x-2 cursor-pointer rounded-full bg-gray-200 px-2 py-2 hover:bg-gray-300 transition">
                <Avatar
                  size={32}
                  src={profileImage}
                  className="bg-button-primary"
                >
                  {!profileImage &&
                    (userProfile?.name?.charAt(0) ||
                      firstName?.charAt(0)?.toUpperCase() ||
                      "U")}
                </Avatar>
                <span className="font-medium text-gray-700">
                  {userProfile?.name ||
                    (firstName && lastName
                      ? `${firstName} ${lastName}`
                      : firstName || lastName || "Loading...")}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
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
          profilePicture: profileImage || "",
          fullName: displayName || "",
          email: displayEmail || "",
          note: userProfile?.note ?? "",
          phoneNumber: displayPhone || "",
          role: displayRole || "",
          hr_full_name: profileData.hr_full_name || "",
          hr_phone: profileData.hr_phone || "",
          website: userProfile?.website || "",
        }}
      />
    </>
  );
};

export default Header;
