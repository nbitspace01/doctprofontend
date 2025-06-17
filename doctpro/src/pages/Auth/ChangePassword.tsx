import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Logo } from "../Common/SVG/svg.functions";
import loginIllustration from "../../assets/illustrationlogin.png";
import { useParams, useNavigate } from "@tanstack/react-router";
import axios from "axios";

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userIdForgotPassword");
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await axios.post(`${URL}/api/user/forgot-password/reset/${userId}`, {
        newPassword: values.newPassword,
      });

      message.success("Password changed successfully!");
      form.resetFields();
      // Redirect to login page after successful password change
      navigate({ to: "/auth/login", replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ?? "Failed to change password";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-50">
      {/* left side  */}
      <div className="hidden lg:block col-span-6">
        <img
          src={loginIllustration}
          alt="Doctor illustration"
          className="w-full h-screen object-contain"
        />
      </div>
      {/* right side  */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-8 text-left">
            Change Password
          </h1>
          <Form
            form={form}
            name="changePassword"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please input your new password!" },
                { min: 8, message: "Password must be at least 8 characters!" },
              ]}
            >
              <Input.Password
                placeholder="Enter new password"
                className="h-12 rounded-lg"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm new password"
                className="h-12 rounded-lg"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-button-primary hover:bg-button-primary rounded-lg text-lg font-semibold"
              >
                Confirm
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
