import React, { useState } from "react";
import { Drawer, Avatar, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import EditProfileDrawer from "./EditProfileDrawer";
import ResetPasswordModal from "./ResetPasswordModal";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileApi } from "../../api/user.api";

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
    hr_full_name?: string;
    hr_phone?: string;
  };
}

const ViewProfileDrawer: React.FC<ViewProfileDrawerProps> = ({
  visible,
  onClose,
  profileData: initialProfileData,
}) => {
  const USER_ID = localStorage.getItem("userId");

  // Fetch fresh profile data when drawer is open
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", USER_ID],
    queryFn: async () => {
      const response = await fetchUserProfileApi(USER_ID!);
      return response;
    },
    enabled: !!USER_ID && visible, // Only fetch when drawer is visible
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Use fresh data from query if available, otherwise fallback to initial data
  const displayName =
    userProfile?.name ||
    (userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.first_name ||
        userProfile?.last_name ||
        initialProfileData.name);
  const displayRole = userProfile?.role || initialProfileData.role;
  const displayEmail = userProfile?.email || initialProfileData.email;
  const displayPhone = userProfile?.phone || initialProfileData.phone;
  const displayNote = userProfile?.note ?? initialProfileData.note;
  const displayHrName =
    userProfile?.hr_full_name || initialProfileData.hr_full_name || "";
  const displayHrPhone =
    userProfile?.hr_phone || initialProfileData.hr_phone || "";
  const normalizedRole = (displayRole || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "");
  const isHospitalAdmin = normalizedRole === "hospitaladmin";
  const profileImage = isHospitalAdmin
    ? userProfile?.logoUrl || userProfile?.profile_picture
    : userProfile?.profile_picture;

  const profileData = {
    name: displayName,
    role: displayRole,
    title: initialProfileData.title,
    note: displayNote,
    email: displayEmail,
    phone: displayPhone,
    hr_full_name: displayHrName,
    hr_email: userProfile?.hr_email || "",
    hr_phone: displayHrPhone,
    website: userProfile?.website || "",
  };
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);

  const handleEditProfile = () => {
    setEditProfileVisible(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileVisible(false);
  };

  const handleSaveProfile = (values: any) => {
    // Handle save profile logic here
    console.log("Saving profile:", values);
    setEditProfileVisible(false);
  };

  const handleChangePassword = () => {
    setResetPasswordVisible(true);
  };

  return (
    <>
      <Drawer
        title="View Profile"
        placement="right"
        onClose={onClose}
        open={visible}
        width={400}
        closeIcon={<CloseOutlined className="text-gray-600" />}
      >
        <div className="flex flex-col space-y-6 h-full">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <Avatar
                size={64}
                src={profileImage}
                className="bg-button-primary"
              >
                {!profileImage && profileData.name.charAt(0)}
              </Avatar>
              <div>
                <h2 className="text-lg font-medium mt-1">{profileData.name}</h2>
                {/* <p className="text-gray-600">{profileData.title}</p> */}
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Note</p>
                  <p className="font-semibold">
                    {profileData.note || "No note"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Role</p>
                  <p className="font-semibold">{profileData.role}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold">
                    {profileData.email || "No email provided"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold">
                    {profileData.phone || "No phone number provided"}
                  </p>
                </div>
                {isHospitalAdmin && (
                  <>
                    <div>
                      <p className="text-gray-600 mb-1">HR Name</p>
                      <p className="font-semibold">
                        {profileData.hr_full_name || "No HR name provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">HR Email</p>
                      <p className="font-semibold">
                        {profileData.hr_email || "No HR email provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">HR Phone</p>
                      <p className="font-semibold">
                        {profileData.hr_phone || "No HR phone number provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Website</p>
                      <p className="font-semibold">
                        {profileData.website || "No website provided"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-auto">
            <Button
              variant="outlined"
              className="w-full border-button-primary  text-button-primary py-2 px-4 rounded-md hover:!bg-button-primary hover:!text-white transition-colors"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
            <Button
              className="w-full bg-button-primary text-white py-2 px-4 rounded-md hover:!bg-button-primary transition-colors"
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </Drawer>

      <EditProfileDrawer
        visible={editProfileVisible}
        onClose={handleEditProfileClose}
        onSave={handleSaveProfile}
        initialValues={{
          fullName: displayName,
          email: displayEmail,
          note: displayNote,
          phoneNumber: displayPhone,
          role: displayRole,
          profilePicture: profileImage,
          hr_full_name:
            userProfile?.hr_full_name ?? initialProfileData.hr_full_name ?? "",
          hr_phone: userProfile?.hr_phone ?? initialProfileData.hr_phone ?? "",
          website: userProfile?.website || "",
        }}
      />
      <ResetPasswordModal
        visible={resetPasswordVisible}
        onCancel={() => setResetPasswordVisible(false)}
        onConfirm={handleChangePassword}
      />
    </>
  );
};

export default ViewProfileDrawer;
