import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { showError, showSuccess } from "../pages/Common/Notification";
import { App } from "antd";

interface ResetPasswordPayload {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export const useResetPassword = () => {
  const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { notification } = App.useApp();

  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const response = await axios.post(
        `${URL}/api/user/reset-password/submit`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(notification, {
        message: "Password Reset Successful",
        description: data.message ?? "Operation completed successfully",
      });
      return data;
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ?? "Failed to reset password";
      showError(notification, {
        message: "Password Reset Failed",
        description: errorMessage,
      });
      throw error;
    },
  });
};
