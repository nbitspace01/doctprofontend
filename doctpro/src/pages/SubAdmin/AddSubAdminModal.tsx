import { UserOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Button, Upload, message, App } from "antd";
import type { UploadProps } from "antd";
import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TOKEN } from "../Common/constant.function";
import { showSuccess } from "../Common/Notification";

interface SubAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  active_user: boolean;
  role: string;
  organization_type: string;
  location: string;
  associated_location: string;
}

interface AddSubAdminModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: SubAdminData | null;
}

interface SubAdminFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  organization_type: string;
  location: string;
  associated_location: string;
  password: string;
  confirmPassword: string;
}

const AddSubAdminModal: React.FC<AddSubAdminModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { notification } = App.useApp();

  const roleOptions = [
    // { value: "in charge", label: "In Charge" },
    // { value: "coordinator", label: "Coordinator" },
    // { value: "assistant", label: "Assistant" },
    // { value: "admin", label: "Admin" },
    // { value: "faculty", label: "Faculty" },
    { value: "subadmin", label: "Sub Admin" },
  ];

  const organizationOptions = [
    { value: "Hospital", label: "Hospital" },
    { value: "College", label: "College" },
    { value: "University", label: "University" },
    { value: "Institute", label: "Institute" },
    { value: "Training Center", label: "Training Center" },
  ];

  const locationOptions = [
    { value: "Chennai", label: "Chennai" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Delhi", label: "Delhi" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Kochi", label: "Kochi" },
  ];

  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      // Handle file upload logic here
      setTimeout(() => {
        onSuccess?.(file);
      }, 0);
    },
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          // first_name: initialData.first_name,
          // last_name: initialData.last_name,
          name: initialData.first_name + " " + initialData.last_name,
          email: initialData.email,
          phone: initialData.phone,
          role: initialData.role,
          organization_type: initialData.organization_type,
          location: initialData.location,
          associated_location: initialData.location,
          status: initialData.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const createSubAdminMutation = useMutation({
    mutationFn: (values: SubAdminFormValues) => {
      const payload = {
        // first_name: values.first_name,
        // last_name: values.last_name,
        name: values.first_name + " " + values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        organization_type: values.organization_type.toLowerCase(),
        role: values.role,
        location: values.location,
        associated_location: values.associated_location,
      };
      return axios.post(`${API_URL}/api/user/create-sub-admin`, payload, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Sub-admin Created Successfully",
        description: data.message,
      });
      form.resetFields();
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      console.error("API Error:", error); // Add this for debugging
      const errorMessage =
        error.response?.data?.message ?? "Failed to create sub-admin";
      message.error(errorMessage);
    },
  });

  const updateSubAdminMutation = useMutation({
    mutationFn: (values: SubAdminFormValues) => {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        organization_type: values.organization_type,
        role: values.role,
        location: values.location,
        associated_location: values.associated_location,
      };

      return axios.put(
        `${API_URL}/api/user/update-sub-admin/${initialData?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Sub-admin Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.data?.message ?? "Failed to update sub-admin";
      message.error(errorMessage);
    },
  });

  const handleSubmit = (values: SubAdminFormValues) => {
    if (initialData) {
      updateSubAdminMutation.mutate(values);
    } else {
      createSubAdminMutation.mutate(values);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Sub Admin" : "Create New Sub-Admin"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex justify-center mb-6">
          <Upload {...uploadProps}>
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
              <UserOutlined className="text-3xl text-gray-400" />
            </div>
          </Upload>
        </div>

        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: "Please enter first name" }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: "Please enter last name" }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="+91 99999 99999" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select Role" options={roleOptions} />
          </Form.Item>

          <Form.Item
            label="Organization Type"
            name="organization_type"
            rules={[
              { required: true, message: "Please select organization type" },
            ]}
          >
            <Select placeholder="Select Type" options={organizationOptions} />
          </Form.Item>
        </div>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Please select location" }]}
        >
          <Select placeholder="Select Location" options={locationOptions} />
        </Form.Item>

        <Form.Item
          label="Associated Location"
          name="associated_location"
          rules={[
            { required: true, message: "Please select associated location" },
          ]}
        >
          <Select placeholder="Select Location" options={locationOptions} />
        </Form.Item>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-base font-medium mb-4">Password Creation</h3>
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600"
            loading={
              initialData
                ? updateSubAdminMutation.isPending
                : createSubAdminMutation.isPending
            }
            disabled={
              initialData
                ? updateSubAdminMutation.isPending
                : createSubAdminMutation.isPending
            }
          >
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddSubAdminModal;
