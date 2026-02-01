import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Card, Input, Typography } from "antd";
import { useState, useEffect, useRef } from "react";
import { Logo } from "../Common/SVG/svg.functions";
import { showError, showSuccess } from "../Common/Notification";
import { verifyOtpApi } from "../../api/auth.api";

const { Link } = Typography;

const ForgotPasswordVerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(50);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { notification } = App.useApp();

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
      console.log("Calling verifyOtpApi with payload:", payload);
      const response = await verifyOtpApi(payload);
      return response.data;
    },
    onSuccess: async (data: any) => {
      console.log("OTP verification response:", data);
      // Store userId - check different possible response structures
      const userId = data.userId || data.user?.id || data.id || data.data?.userId || data.data?.user?.id;
      console.log("Extracted userId:", userId);
      
      if (userId) {
        localStorage.setItem("userIdForgotPassword", String(userId));
        console.log("userId saved to localStorage:", localStorage.getItem("userIdForgotPassword"));
      } else {
        console.error("No userId found in response:", data);
        showError(notification, { message: "Error", description: "User ID not found in response. Please try again." });
        return;
      }
      
      navigate({
        to: "/auth/change-password",
        replace: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      showSuccess(notification, { message: "Success", description: "Verification successful! ✅" });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Invalid OTP. Please try again.";
      showError(notification, { message: "Verification Failed", description: errorMessage });
      console.log("error", error);
    },
  });

  const handleVerify = () => {
    console.log("Verify Now button clicked");
    console.log("Email from localStorage:", email);
    console.log("OTP values:", otp);
    
    if (!email) {
      console.error("Email is missing from localStorage");
      showError(notification, { message: "Error", description: "Email is required" });
      return;
    }

    const otpString = otp.join("");
    console.log("OTP string:", otpString);
    
    if (otpString.length !== 6) {
      console.error("OTP is incomplete. Length:", otpString.length);
      showError(notification, { message: "Error", description: "Please enter a complete OTP" });
      return;
    }

    const payload = {
      email,
      otp: otpString,
    };

    console.log("Calling API /api/user/verify-otp with payload:", payload);
    console.log("Full API URL:", `${URL}/api/user/verify-otp`);
    
    mutation.mutate(payload);
  };

  const handleResend = () => {
    setTimeLeft(50);
    setOtp(["", "", "", "", "", ""]);
    showSuccess(notification, { message: "Success", description: "OTP has been resent" });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Logo />
        </div>

        <div className="mb-8">
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            OTP
          </label>
          <div className="flex gap-2 justify-center">
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
          </div>
        </div>
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

export default ForgotPasswordVerifyOtp;
