import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Card, Input, Space, Typography, message } from "antd";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Logo } from "../../Common/SVG/svg.functions";
import { showMessage } from "../../Common/ResponseMessage";
import { useAuth } from "../../Common/Context/AuthContext";

const { Title, Link } = Typography;

const Verification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(50);
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setToken } = useAuth();
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    // Handle pasting
    if (value.length > 1) {
      const otpArray = value.replace(/\D/g, "").split("").slice(0, 6);
      const newOtp = [...otp];

      // Fill available slots with pasted numbers
      otpArray.forEach((digit, idx) => {
        if (idx < 6) {
          newOtp[idx] = digit;
        }
      });

      setOtp(newOtp);

      // Focus the next empty input or the last input if all filled
      const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    // Handle single character input
    if (value.match(/^[0-9]$/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      // If current input has value, clear it
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      }
      // If current input is empty, clear previous input and move focus
      else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle left arrow key
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow key
    else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const mutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const response = await axios.post(`${URL}/api/user/verify-otp`, payload);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        // Set all localStorage items first
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("roleId", data.user.role.id);
        localStorage.setItem("roleName", data.user.role.name);
        localStorage.setItem("firstName", data.user.first_name);
        localStorage.setItem("lastName", data.user.last_name);

        // Update context token
        setToken(data.token);

        // Wait until the token is available in localStorage (max 1 second)
        let attempts = 0;
        const maxAttempts = 10;
        const delay = 100; // ms

        const waitForTokenAndNavigate = () => {
          const storedToken = localStorage.getItem("userToken");
          if (storedToken) {
            // Token is available, now navigate
            if (data.user.role.name === "admin") {
              navigate({ to: "/app/dashboard", replace: true });
            } else {
              navigate({ to: "/app/subadmin/dashboard", replace: true });
            }
            showMessage.success("Verification successful! ✅");
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(waitForTokenAndNavigate, delay);
          } else {
            // Token still not available after waiting
            message.error(
              "Verification completed but there was an issue. Please try logging in again."
            );
            // Clear any partial data
            localStorage.removeItem("userToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("roleId");
            localStorage.removeItem("roleName");
            localStorage.removeItem("firstName");
            localStorage.removeItem("lastName");
            navigate({ to: "/auth/login", replace: true });
          }
        };

        waitForTokenAndNavigate();
      } catch (error) {
        console.error("Error during verification success:", error);
        message.error(
          "Verification completed but there was an issue. Please try logging in again."
        );
        // Clear any partial data
        localStorage.removeItem("userToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("roleId");
        localStorage.removeItem("roleName");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        navigate({ to: "/auth/login", replace: true });
      }
    },
    onError: (error) => {
      message.error("Invalid OTP. Please try again.");
      console.log("error", error);
    },
  });

  const handleVerify = () => {
    if (!email) {
      message.error("Email is required");
      return;
    }

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      message.error("Please enter a complete OTP");
      return;
    }

    const payload = {
      email,
      otp: otpString,
    };

    mutation.mutate(payload);
  };

  const handleResend = () => {
    setTimeLeft(50);
    setOtp(["", "", "", "", "", ""]);
    message.info("OTP has been resent");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] rounded-xl shadow-lg">
        <div>
          <div className="flex flex-col items-center mb-8">
            <Logo />
          </div>
          <Title level={4} className="!text-left mb-6">
            OTP Verification
          </Title>
        </div>

        <Space className="w-full justify-center mb-8">
          {otp.map((digit, index) => (
            <Input
              key={`otp-input-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el as unknown as HTMLInputElement;
              }}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData("text");
                handleOtpChange(pastedData, index);
              }}
              className="!w-12 !h-12 text-center text-lg"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </Space>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Did not receive OTP?</span>
            <Link
              onClick={handleResend}
              className="text-blue-600 cursor-pointer"
              disabled={timeLeft > 0}
            >
              Resend
            </Link>
          </div>
          <span className="text-gray-600">
            ({Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")})
          </span>
        </div>

        <Button
          type="primary"
          className="w-full h-12 rounded-md text-lg bg-[#1f479d]"
          onClick={handleVerify}
          loading={mutation.isPending}
        >
          Verify Now
        </Button>
      </Card>
    </div>
  );
};

export default Verification;
