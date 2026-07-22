import {
  EyeInvisibleOutlined,
  EyeOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Checkbox, Form, Input } from "antd";
import loginIllustration from "../../assets/illustrationlogin.png";
import { showError, showSuccess } from "../Common/Notification";
import { Logo } from "../Common/SVG/svg.functions";
import { userLoginApi } from "../../api/auth.api";
import { useAuth } from "../Common/Context/AuthContext";

/* ---------- TYPES ---------- */
interface LoginFormValues {
  identifier: string;
  password: string;
  remember?: boolean;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { notification } = App.useApp();
  const { setToken } = useAuth();

  /* ---------- PERSIST SESSION (same as OTP verification flow) ---------- */
  const persistUser = (data: any) => {
    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("roleId", data.user.role.id);
    localStorage.setItem("roleName", data.user.role.name);
    if (data.user.first_name) localStorage.setItem("firstName", data.user.first_name);
    if (data.user.last_name) localStorage.setItem("lastName", data.user.last_name);
    if (data.user.email) localStorage.setItem("userEmail", data.user.email);

    setToken(data.token);
  };

  /* ---------- LOGIN MUTATION ---------- */
  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const trimmed = values.identifier.trim();
      const isEmail = trimmed.includes("@");
      return userLoginApi(
        isEmail
          ? { email: trimmed, password: values.password }
          : { phone: trimmed, password: values.password },
      );
    },
    onSuccess: (data: any) => {
      persistUser(data);
      showSuccess(notification, {
        message: "Login Successful",
        description: data?.message ?? "Welcome back!",
      });
      navigate({ to: "/app/dashboard", replace: true });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred during login";
      showError(notification, {
        message: "Login Failed",
        description: errorMessage,
        duration: 5,
      });
    },
  });

  /* ---------- SUBMIT ---------- */
  const handleSubmit = (values: LoginFormValues) => {
    const { remember, identifier, password } = values;
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    // Always store login identifier for OTP verification
    localStorage.setItem("userLoginIdentifier", trimmed);
    localStorage.setItem("userLoginMethod", isEmail ? "email" : "phone");
    if (remember) {
      if (isEmail) {
        localStorage.setItem("userEmail", trimmed);
      } else {
        localStorage.setItem("userPhone", trimmed);
      }
    } else {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
    }

    loginMutation.mutate({ identifier: trimmed, password });
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-50">
      {/* Left Illustration */}
      <div className="hidden lg:block col-span-7">
        <img
          src={loginIllustration}
          alt="Login Illustration"
          className="w-full h-screen object-contain"
        />
      </div>

      {/* Right Login Form */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-8">Login</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ remember: true }}
          >
            {/* Email */}
            <Form.Item
              label="Email or Phone"
              name="identifier"
              rules={[
                { required: true, message: "Please enter your email or phone" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const trimmed = String(value).trim();
                    const isEmail = trimmed.includes("@");
                    const isPhone = /^\+?\d{8,15}$/.test(trimmed);
                    if (isEmail || isPhone) return Promise.resolve();
                    return Promise.reject(
                      new Error("Enter a valid email or phone number"),
                    );
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter your email or phone number"
                suffix={<MailOutlined className="text-gray-400" />}
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                placeholder="********"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* Remember & Forgot */}
            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember Me</Checkbox>
                </Form.Item>
                <a
                  href="/auth/forgot-password"
                  className="text-button-primary"
                >
                  Forgot Password?
                </a>
              </div>
            </Form.Item>

            {/* Submit */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-10 bg-button-primary"
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
