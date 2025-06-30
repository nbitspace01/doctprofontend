import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Form, Input } from "antd";
import axios from "axios";
import React from "react";
import PhoneNumberInput from "../Common/PhoneNumberInput";
import { showError, showSuccess } from "../Common/Notification";

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
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const USER_ID = localStorage.getItem("userId");

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.put(`${URL}/api/user/profile/${USER_ID}`, {
        first_name: values.fullName.split(" ")[0] || values.fullName,
        last_name: values.fullName.split(" ").slice(1).join(" ") || "",
        note: values.note || "",
        phone: values.phoneNumber,
      });
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(notification, {
        message: "Profile Updated Successfully",
        description: data.message,
      });
      // Invalidate and refetch userProfile query
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      onSave(data);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ?? "Failed to update profile";
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
          >
            Save Profile
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Avatar size={64} className="bg-button-primary">
              {initialValues?.fullName.charAt(0)}
            </Avatar>
          </div>
        </div>
        {/* <p className="text-center text-gray-500 text-sm mb-6">
          JPG/PNG Format, Max Size 5MB
        </p> */}

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, min: 3, message: "Required, Min 3 Characters" },
          ]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          label="Note"
          name="note"
          // rules={[
          //   { required: true, min: 3, message: "Required, Min 3 Characters" },
          // ]}
        >
          <Input placeholder="Enter note" />
        </Form.Item>

        <Form.Item label="Email Address" name="email">
          <Input disabled className="bg-gray-50" />
        </Form.Item>

        {/* <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input placeholder="Enter phone number" prefix={<MobileIcon />} />
        </Form.Item> */}
        <PhoneNumberInput name="phoneNumber" label="Phone Number" />

        <Form.Item label="Role" name="role">
          <Input disabled className="bg-gray-50" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditProfileDrawer;
