import { apiClient } from "./api";

// ----- User Auth APIs -----

// User Registration
export const userRegisterApi = (data: any) => {
  return apiClient.post<any>("/api/user/register", data);
};

// User Login
export const userLoginApi = (data: { email: string; password: string }) => {
  return apiClient.post<any>("/api/user/login", data);
};

// Set User Password (Initial Registration flow)
export const setUserPasswordApi = (userId: string, data: any) => {
  return apiClient.post<any>(`/api/user/register/set-password/${userId}`, data);
};

// Forgot Password - Send OTP
export const forgotPasswordSendOtpApi = (data: { email: string }) => {
  return apiClient.post<any>("/api/user/forgot-password/send-otp", data);
};

// OTP Verification (Shared for Registration and Forgot Password)
export const verifyOtpApi = (data: { email: string; otp: string }) => {
  return apiClient.post<any>("/api/user/verify-otp", data);
};

// Forgot Password - Reset Password
export const forgotPasswordResetApi = (userId: string, data: { newPassword: string }) => {
  return apiClient.post<any>(`/api/user/forgot-password/reset/${userId}`, data);
};

// Verify User Token (Alternative flow)
export const verifyUserApi = (data: { token: string }) => {
  return apiClient.post<any>("/api/auth/verify-user", data);
};