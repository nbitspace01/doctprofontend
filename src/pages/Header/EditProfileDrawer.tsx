import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Avatar,
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import React, { useState } from "react";
import PhoneNumberInput from "../Common/PhoneNumberInput";
import { showError, showSuccess } from "../Common/Notification";
import { updateUserProfileApi } from "../../api/user.api";

interface EditProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  initialValues?: {
    fullName: string;
    email: string;
    note: string;
    phoneNumber: string;
    role: string;
    profilePicture?: string;
  };
}

const EditProfileDrawer: React.FC<EditProfileDrawerProps> = ({
  visible,
  onClose,
  onSave,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const USER_ID = localStorage.getItem("userId");
  const roleFromStorage = localStorage.getItem("roleName");

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setPreviewUrl(initialValues.profilePicture || null);
    }
  }, [form, initialValues]);

  const normalizedRole = (
    initialValues?.role ||
    roleFromStorage ||
    ""
  )
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "");
  const isHospitalAdmin = normalizedRole === "hospitaladmin";

  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      const formData = new FormData();

      const firstName = values.fullName.split(" ")[0] || values.fullName;
      const lastName = values.fullName.split(" ").slice(1).join(" ") || "";

      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      if (isHospitalAdmin) {
        formData.append("name", values.fullName || "");
      }
      formData.append("note", values.note || "");
      if (values.phoneNumber) {
        formData.append("phone", values.phoneNumber);
      }

      if (file) {
        formData.append("profile_picture", file);
        if (isHospitalAdmin) {
          formData.append("logo", file);
        }
      }

      // Use centralized API
      // USER_ID captured from localStorage in component scope
      if (!USER_ID) throw new Error("User ID not found");

      return updateUserProfileApi(USER_ID, formData);
    },
    onSuccess: (response: any) => {
      const data = response;

      showSuccess(notification, {
        message: "Profile Updated Successfully",
        description: data.message || "Profile updated",
      });
      // Invalidate and refetch userProfile query
      const currentUserId = localStorage.getItem("userId");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", currentUserId],
      });

      // Update localStorage with new name if available
      if (data.id) {
        const updatedName =
          data.name ||
          (data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.first_name || data.last_name || "");
        if (updatedName) {
          const nameParts = updatedName.trim().split(" ");
          localStorage.setItem("firstName", nameParts[0] || "");
          localStorage.setItem("lastName", nameParts.slice(1).join(" ") || "");
        }
        if (data.phone) {
          localStorage.setItem("userPhone", data.phone);
        }
      }

      // Refetch the query immediately to update UI
      queryClient.refetchQueries({ queryKey: ["userProfile", currentUserId] });

      onSave(data);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        "Failed to update profile";
      showError(notification, {
        message: "Failed to update profile",
        description: errorMessage,
      });
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      updateProfileMutation.mutate(values);
    });
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isLt2M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }
      setFile(file);
      setPreviewUrl(window.URL.createObjectURL(file));
      return false;
    },
    showUploadList: false,
  };

  return (
    <Drawer
      title="Edit Profile"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            className="bg-button-primary"
            type="primary"
            onClick={handleSubmit}
            loading={updateProfileMutation.isPending}
          >
            Save Profile
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <div className="mb-6 flex flex-col items-center">
          <Upload
            {...uploadProps}
            showUploadList={false}
            className="cursor-pointer"
          >
            <div className="relative group">
              <Avatar
                src={previewUrl}
                size={100}
                icon={!previewUrl && <UserOutlined />}
                className="border border-gray-200"
              />

              {/* Hover Overlay */}
              <div
                className="
        absolute inset-0 rounded-full 
        bg-black/50 opacity-0 
        group-hover:opacity-100 
        flex items-center justify-center
        transition-opacity
      "
              >
                <UploadOutlined className="text-white text-xl" />
              </div>
            </div>
          </Upload>
        </div>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, min: 3, message: "Required, Min 3 Characters" },
          ]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item label="Note" name="note">
          <Input placeholder="Enter note" />
        </Form.Item>

        <Form.Item label="Email Address" name="email">
          <Input disabled className="bg-gray-50" />
        </Form.Item>

        <PhoneNumberInput name="phoneNumber" label="Phone Number" />

        <Form.Item label="Role" name="role">
          <Input disabled className="bg-gray-50" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditProfileDrawer;
