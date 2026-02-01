import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import loginIllustration from "../../assets/illustrationlogin.png";
import { Logo } from "../Common/SVG/svg.functions";
import { useNavigate } from "@tanstack/react-router";
import { forgotPasswordSendOtpApi } from "../../api/auth.api";

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await forgotPasswordSendOtpApi({
        email: values.email,
      });

      // Save email to localStorage so it's available in the verify OTP page
      localStorage.setItem("userEmail", values.email);
      
      message.success("Password reset link has been sent to your email");
      navigate({ to: "/auth/forgot-password/verify-otp", replace: true });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      message.error(error.response?.data?.message ?? "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-50">
      <div className="hidden lg:block col-span-7">
        <img
          src={loginIllustration}
          alt="Doctor illustration"
          className="w-full h-screen object-contain"
        />
      </div>
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Form
            name="forgot-password"
            className="mt-8 space-y-6"
            onFinish={onFinish}
            layout="vertical"
          >
            <label htmlFor="email" className="text-lg font-medium">
              Forgot Password
            </label>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email address"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-button-primary hover:bg-button-primary rounded-lg h-12 text-lg"
                loading={loading}
              >
                Submit
              </Button>
            </Form.Item>

            <div className="text-center">
              <a
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to Login
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
