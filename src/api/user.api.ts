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

export const updateUserProfileApi = (
  userId: string,
  data: FormData | UpdateUserProfilePayload,
) => {
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

export const resetPasswordApi = async (
  payload: ResetPasswordPayload,
) => {
  return await apiClient.post(
    "/api/user/reset-password/submit",
    payload,
  );
};
