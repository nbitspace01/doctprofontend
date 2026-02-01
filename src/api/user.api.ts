import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { showError, showSuccess } from "../pages/Common/Notification";
import { apiClient } from "./api";

export interface UpdateUserProfilePayload {
  first_name?: string;
  last_name?: string;
  note?: string;
  phone?: string;
  profile_picture?: File;
  [key: string]: any;
}

export const updateUserProfileApi = (userId: string, data: FormData | UpdateUserProfilePayload) => {
  return apiClient.put<any>(`/api/user/profile/${userId}`, data);
};

export const fetchUserProfileApi = (userId: string) => {
  return apiClient.get<any>(`/api/user/profile/${userId}`);
};

interface ResetPasswordPayload {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export const useResetPassword = () => {
  const { notification } = App.useApp();

  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      return apiClient.post<any>("/api/user/reset-password/submit", payload);
    },
    onSuccess: (data) => {
      showSuccess(notification, {
        message: "Password Reset Successful",
        description: data.message ?? "Operation completed successfully",
      });
      return data;
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Password Reset Failed",
        description: error.message ?? "Failed to reset password",
      });
      throw error;
    },
  });
};
