import {
  EyeInvisibleOutlined,
  EyeOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Checkbox, Form, Input, message, Select } from "antd";
import axios from "axios";
import loginIllustration from "../../assets/illustrationlogin.png";
import { Logo } from "../Common/SVG/svg.functions";

interface LoginFormValues {
  email: string;
  password: string;
  loginType: string;
  remember?: boolean;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await axios.post(`${URL}/api/user/login`, values);
      return response.data;
    },
    onSuccess: (data) => {
      message.success("Login successful!");
      console.log("Login successful!", data);
      navigate({ to: "/auth/verify" });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message ?? "Login failed. Please try again."
      );
    },
  });

  const onFinish = (values: LoginFormValues) => {
    const { remember, email, ...loginValues } = values;
    localStorage.setItem("userEmail", email);
    loginMutation.mutate({ ...loginValues, email });
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-50">
      {/* Left illustration section - 7 columns */}
      <div className="hidden lg:block col-span-7">
        <img
          src={loginIllustration}
          alt="Doctor illustration"
          className="w-full h-screen object-contain"
        />
      </div>

      {/* Right login form section - 5 columns */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          {/* Login Text */}
          <h1 className="text-2xl font-bold text-gray-800 mb-8 text-left">
            Login
          </h1>

          {/* Login Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ remember: true }}
          >
            {/* User Type Dropdown */}
            <Form.Item
              label="User Type"
              name="loginType"
              rules={[{ required: true, message: "Please select user type!" }]}
            >
              <Select
                className="w-full"
                placeholder="Select user type"
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "sub-admin", label: "Sub-Admin" },
                ]}
              />
            </Form.Item>

            {/* Email Input */}
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                suffix={<MailOutlined className="text-gray-400" />}
                placeholder="mail@xyz.com"
              />
            </Form.Item>

            {/* Password Input */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="********"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* Remember Me and Forgot Password */}
            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember Me</Checkbox>
                </Form.Item>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </a>
              </div>
            </Form.Item>

            {/* Login Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-10 bg-[#1f479d]"
                loading={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
