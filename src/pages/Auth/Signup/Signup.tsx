import { GoogleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Divider, Form, Input, Select, Typography } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import React, { useState } from "react";
import { userRegisterApi } from "../../../api/auth.api";
import loginIllustration from "../../../assets/illustrationlogin.png";

const { Title, Link } = Typography;

interface FormValues {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_username?: string;
  user_type: "admin" | "sub-admin";
}

const SignUp: React.FC = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [pageState, setPageState] = useState<"form" | "success">("form");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await userRegisterApi(values);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("User signed up:", data.user);
      console.log("Assigned Organization:", data.organization);
      setPageState("success");
      navigate({ to: "/auth/verify" });
    },
    onError: (error: any) => {
      console.error("Signup failed:", error.response?.data ?? error.message);
      alert(error.response?.data?.message ?? "Signup failed. Please try again.");
    },
  });

  const onFinish = (values: FormValues) => {
    mutation.mutate(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleFormChange = (
    _: Record<string, unknown>,
    allValues: FormValues
  ) => {
    const isComplete = !!(
      allValues.email &&
      allValues.password &&
      allValues.first_name &&
      allValues.last_name
    );
    setIsFormValid(isComplete);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-tertiary relative dark:bg-black dark:text-white ">
      {pageState === "form" ? (
        <div
          className={`rounded-lg shadow-lg absolute top-1/2 transform -translate-y-1/2 gap-6 grid grid-cols-12 ${
            document.documentElement.classList.contains("dark")
              ? "bg-darksecondary text-white"
              : "bg-white"
          }`}
          style={{
            // padding: "5px 15px",
            // marginTop: "38px",
            marginBottom: "20px",
          }}
        >
          <div className="col-span-6 p-4">
            <img
              src={loginIllustration}
              alt="loginleftimg"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="col-span-6 rounded-lg shadow-lg p-6">
            <Title
              level={3}
              className="text-left"
              style={{
                marginBottom: "5px",
              }}
            >
              Sign up
            </Title>
            <Form
              name="Sign Up"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              onValuesChange={handleFormChange}
              layout="vertical"
            >
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-4">
                <Form.Item
                  label="First Name"
                  name="first_name"
                  className="w-full sm:w-1/2 dark:text-white"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your first name!",
                    },
                  ]}
                >
                  <Input
                    placeholder="First Name"
                    className="dark:bg-darkprimary dark:text-white dark:border-gray-600"
                  />
                </Form.Item>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  className="w-full sm:w-1/2 dark:text-white"
                  rules={[
                    { required: true, message: "Please enter your last name!" },
                  ]}
                >
                  <Input
                    placeholder="Last Name"
                    className="dark:bg-darkprimary dark:text-white dark:border-gray-600"
                  />
                </Form.Item>
              </div>
              <Form.Item
                label="User Type"
                name="userType"
                className="dark:text-white"
                rules={[
                  { required: true, message: "Please select a user type!" },
                ]}
              >
                <Select
                  placeholder="Select user type"
                  className="dark:bg-darkprimary dark:text-white"
                >
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="sub-admin">Sub-Admin</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                className="dark:text-white"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Enter your Email"
                  className="dark:bg-darkprimary dark:text-white dark:border-gray-600"
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                className="dark:text-white"
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject("Please enter your password!");
                      }
                      if (value.length < 8) {
                        return Promise.reject(
                          "Password must be at least 8 characters long!"
                        );
                      }
                      if (!/[A-Z]/.test(value)) {
                        return Promise.reject(
                          "Password must contain at least one uppercase letter!"
                        );
                      }
                      if (!/\d/.test(value)) {
                        return Promise.reject(
                          "Password must contain at least one number!"
                        );
                      }
                      if (!/[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value)) {
                        return Promise.reject(
                          "Password must contain at least one special character!"
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Enter your Password"
                  className="dark:bg-darkprimary dark:text-white dark:border-gray-600"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-[#1f479d] font-bold"
                  disabled={!isFormValid || mutation.isPending}
                >
                  {mutation.isPending ? "Signing up..." : "Sign up"}
                </Button>
                <Paragraph type="secondary" className="text-center py-1">
                  Already have an account ?{" "}
                  <Link href="/auth/login">Log in</Link>
                </Paragraph>
              </Form.Item>
              <Divider>OR</Divider>
              <Button
                type="default"
                className="w-full flex items-center justify-center border-gray-300 shadow"
              >
                <GoogleOutlined
                  style={{ fontSize: "16px", marginRight: "8px" }}
                />
                Sign up with Google
              </Button>
              <div className="flex justify-center mt-4">
                <Link style={{ color: "#1f479d" }}>Contact us</Link>
              </div>
            </Form>
          </div>
        </div>
      ) : (
        // <SignupSuccessPage />
        ""
      )}
    </div>
  );
};

export default SignUp;
