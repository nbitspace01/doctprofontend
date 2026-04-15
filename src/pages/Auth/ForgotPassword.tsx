import React, { useState } from "react";
import { App, Form, Input, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import loginIllustration from "../../assets/illustrationlogin.png";
import { Logo } from "../Common/SVG/svg.functions";
import { useNavigate } from "@tanstack/react-router";
import { forgotPasswordSendOtpApi } from "../../api/auth.api";
import { showError, showSuccess } from "../Common/Notification";

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const onFinish = async (values: { identifier: string }) => {
    setLoading(true);
    try {
      const trimmed = values.identifier.trim();
      const isEmail = trimmed.includes("@");
      await forgotPasswordSendOtpApi({
        ...(isEmail ? { email: trimmed } : { phone: trimmed }),
      });

      // Save identifier to localStorage so it's available in the verify OTP page
      localStorage.setItem("forgotPasswordIdentifier", trimmed);
      localStorage.setItem("forgotPasswordMethod", isEmail ? "email" : "phone");
      if (isEmail) {
        localStorage.setItem("userEmail", trimmed);
      } else {
        localStorage.setItem("userPhone", trimmed);
      }
      
      showSuccess(notification, {
        message: "OTP Sent",
        description: isEmail
          ? "OTP has been sent to your email"
          : "OTP has been sent to your phone",
      });
      navigate({ to: "/auth/forgot-password/verify-otp", replace: true });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      showError(notification, {
        message: "Request Failed",
        description:
          error.response?.data?.message ?? "Failed to send OTP",
      });
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
            <label htmlFor="identifier" className="text-lg font-medium">
              Forgot Password
            </label>
            <Form.Item
              name="identifier"
              rules={[
                {
                  required: true,
                  message: "Please input your email or phone!",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const trimmed = String(value).trim();
                    const isEmail = trimmed.includes("@");
                    const isPhone = /^\+?\d{8,15}$/.test(trimmed);
                    if (isEmail || isPhone) return Promise.resolve();
                    return Promise.reject(
                      new Error("Please enter a valid email or phone"),
                    );
                  },
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email or phone number"
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
