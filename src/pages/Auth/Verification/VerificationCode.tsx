import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { useState } from "react";
import { verifyUserApi } from "../../../api/auth.api";

const { Title, Paragraph, Link } = Typography;

const VerificationCode = () => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const navigate = useNavigate();

  const mutation = useMutation<any, Error, string>({
    mutationFn: async (code) => {
      const response = await verifyUserApi({
        token: code,
      });
      return response.data;
    },
    onSuccess: (data) => {
      message.success("Verification successful! ✅");
      console.log(data);
      navigate({ to: "/auth/login" });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message ?? "Error verifying code. ❌ Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!verificationCode) {
      message.error("Please enter a verification code");
      return;
    }
    mutation.mutate(verificationCode);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-tertiary dark:bg-black dark:text-white ">
      <div className="relative h-screen w-full">
        <Card className="  rounded-lg shadow-lg absolute top-[200px] left-1/2 transform -translate-x-1/2">
          <Title level={2} className="mb-4 font-bold">
            Please Enter Verification
          </Title>
          <Paragraph className="text-sm">
            A verification token has been sent to{" "}
            <span className="!font-bold mr-1">your email</span>
            Please check your email and enter the verification token below.
          </Paragraph>
          <Form name="Verification" layout="vertical">
            <div className="flex gap-4">
              <Form.Item
                label="Verification Token"
                name="verification_token"
                className="w-full"
              >
                <Input
                  className="py-3"
                  placeholder="Enter your Verification token"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              className="w-full  dark:bg-black dark:text-white flex items-center justify-center py-6 rounded  bg-[#1f479d] text-white"
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <div className="flex justify-between items-center mt-4">
              <Link className="!text-[#1f479d]">Resend Token</Link>
              <Link className="!text-[#1f479d]" href="/auth/request-token">
                Change Email
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default VerificationCode;
