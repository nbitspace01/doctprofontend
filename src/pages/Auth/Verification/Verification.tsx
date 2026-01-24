import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Card, Input, Space, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../../Common/SVG/svg.functions";
import { useAuth } from "../../Common/Context/AuthContext";
import type { InputRef } from "antd";
import { verifyOtpApi } from "../../../api/auth.api";


const { Title, Link } = Typography;

const OTP_LENGTH = 6;
const RESEND_TIME = 50;

const Verification = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(RESEND_TIME);

  const navigate = useNavigate();
  const inputRefs = useRef<(InputRef | null)[]>([]);
  const { setToken } = useAuth();

  const email = localStorage.getItem("userEmail");

  /* -------------------- TIMER -------------------- */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* -------------------- OTP HANDLERS -------------------- */
  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return;

    const newOtp = [...otp];

    digits.split("").forEach((digit, i) => {
      if (index + i < OTP_LENGTH) {
        newOtp[index + i] = digit;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (newOtp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      setOtp(newOtp);
    }
  };

  /* -------------------- VERIFY OTP -------------------- */
  const verifyMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      return verifyOtpApi(payload);
    },
    onSuccess: (data) => {  
      persistUser(data);
      message.success("Verification successful! 🎉");
      navigate({ to: "/app/dashboard", replace: true });
    },
    onError: () => {
      message.error("Invalid OTP. Please try again.");
    },
  });

  const persistUser = (data: any) => {
    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("roleId", data.user.role.id);
    localStorage.setItem("roleName", data.user.role.name);
    localStorage.setItem("firstName", data.user.first_name);
    localStorage.setItem("lastName", data.user.last_name);
    localStorage.setItem("userEmail", data.user.email);

    setToken(data.token);
  };

  const handleVerify = () => {
    if (!email) {
      message.error("Email not found. Please login again.");
      navigate({ to: "/auth/login" });
      return;
    }

    const otpString = otp.join("");

    if (otpString.length !== OTP_LENGTH) {
      message.error("Please enter complete OTP");
      return;
    }

    verifyMutation.mutate({ email, otp: otpString });
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeLeft(RESEND_TIME);
    message.success("OTP resent successfully");
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Logo />
        </div>

        <Title level={4} className="!text-left mb-6">
          OTP Verification
        </Title>

        <Space className="w-full justify-center mb-8">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="!w-12 !h-12 text-center text-lg"
              maxLength={OTP_LENGTH}
              autoFocus={index === 0}
            />
          ))}
        </Space>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Did not receive OTP?</span>
            <Link onClick={handleResend} disabled={timeLeft > 0}>
              Resend
            </Link>
          </div>
          <span className="text-gray-600">
            00:{String(timeLeft).padStart(2, "0")}
          </span>
        </div>

        <Button
          type="primary"
          className="w-full h-12 rounded-md text-lg bg-[#1f479d]"
          onClick={handleVerify}
          loading={verifyMutation.isPending}
        >
          Verify Now
        </Button>
      </Card>
    </div>
  );
};

export default Verification;
