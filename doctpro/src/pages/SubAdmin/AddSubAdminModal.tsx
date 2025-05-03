import { UserOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Button, Upload, message } from "antd";
import type { UploadProps } from "antd";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface AddSubAdminModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

interface SubAdminFormValues {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  orgType: string;
  location: string;
  locationAllocation: string;
  password: string;
  confirmPassword: string;
}

const AddSubAdminModal: React.FC<AddSubAdminModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const roleOptions = [
    { value: "in charge", label: "In Charge" },
    { value: "coordinator", label: "Coordinator" },
    { value: "assistant", label: "Assistant" },
    { value: "admin", label: "Admin" },
    { value: "faculty", label: "Faculty" },
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

  const createSubAdminMutation = useMutation({
    mutationFn: (data: SubAdminFormValues) =>
      axios.post("/api/create/sub-admin", data),
    onSuccess: () => {
      message.success("Sub-admin created successfully");
      form.resetFields();
      onCancel();
    },
    onError: (error: any) => {
      // Check if the error has a response property
      const errorMessage =
        error.response?.data?.message ?? "Failed to create sub-admin";
      message.error(errorMessage);
    },
  });

  return (
    <Modal
      title="Create New Sub-Admin"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          createSubAdminMutation.mutate(values);
        }}
      >
        <div className="flex justify-center mb-6">
          <Upload {...uploadProps}>
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
              <UserOutlined className="text-3xl text-gray-400" />
            </div>
          </Upload>
        </div>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="Enter full name" />
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
            name="orgType"
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
          label="Location based allocation"
          name="locationAllocation"
          rules={[
            { required: true, message: "Please select location allocation" },
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
            loading={createSubAdminMutation.isPending}
          >
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddSubAdminModal;
