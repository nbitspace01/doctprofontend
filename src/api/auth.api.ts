import { apiClient } from "./api";
import { buildQueryParams } from "../utils/buildQueryParams";



// ----- User Auth APIs -----
// User Login
export const userLoginApi = (data: { email: string; password: string }) => {
  return apiClient.post<any>("/api/auth/login", data);
};

// User Logout
export const userLogoutApi = () => {
  return apiClient.post<any>("/api/auth/logout");
};

// User Password Reset
export const userPasswordResetApi = (data: { email: string }) => {
  return apiClient.post<any>("/api/auth/password-reset", data);
};

// User Password Update
export const userPasswordUpdateApi = (data: {
  token: string;
  newPassword: string;
}) => {
  return apiClient.post<any>("/api/auth/password-update", data);
};

// Fetch User Profile
export const fetchUserProfileApi = () => {
  return apiClient.get<any>("/api/auth/profile");
};

// Update User Profile
export const updateUserProfileApi = (data: any) => {
  return apiClient.put<any>("/api/auth/profile", data);
};

// OTP Verification
export const verifyOtpApi = (data: { email: string; otp: string }) => {
  return apiClient.post<any>("/api/auth/verify-otp", data);
};

// Resend OTP
export const resendOtpApi = (data: { email: string }) => {
  return apiClient.post<any>("/api/auth/resend-otp", data);
};