import { useNavigate } from "@tanstack/react-router";
import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { useResetPassword } from "../../api/user.api";

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (values: any) => void;
}

const passwordRules = [
  { required: true, message: "Please input your password!" },
  { min: 12, message: "Password must be at least 12 characters." },
  { pattern: /[A-Z]/, message: "At least one uppercase letter." },
  { pattern: /[a-z]/, message: "At least one lowercase letter." },
  { pattern: /[0-9]/, message: "At least one number." },
  { pattern: /[^A-Za-z0-9]/, message: "At least one special character." },
];

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("User ID not found");
      }

      await resetPasswordMutation.mutateAsync({
        userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      form.resetFields();
      onConfirm(values);
      onCancel();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Password reset failed:", error);
    }
  };

  const handleForgotPassword = () => {
    navigate({ to: "/auth/forgot-password", replace: true });
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      closable
      className="!rounded-2xl"
      width={600}
    >
      <div className="p-2 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please input your old password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={passwordRules}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <div className="mb-2 text-blue-500">
            Please add all necessary characters to create safe password
          </div>
          <ul className="mb-4 text-sm list-disc pl-5">
            <li>Minimum Characters 12</li>
            <li className="text-green-600">One Uppercase Letter</li>
            <li>One Lowercase Letter</li>
            <li>One Special Character</li>
            <li>One Number</li>
          </ul>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div className="flex justify-between items-center mt-6">
            <Button
              type="link"
              onClick={handleForgotPassword}
              className="!p-0 !text-blue-600"
            >
              Forgot Password
            </Button>
            <div>
              <Button onClick={onCancel} className="mr-2 bg-gray-200">
                Cancel
              </Button>
              <Button
                type="primary"
                loading={resetPasswordMutation.isPending}
                onClick={handleOk}
                className="bg-blue-700"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
