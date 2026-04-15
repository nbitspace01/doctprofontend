import { apiClient } from "./api";

// ----- User Auth APIs -----

// User Registration
export const userRegisterApi = (data: any) => {
  return apiClient.post<any>("/api/user/register", data);
};

// User Login (Email or Phone)
export const userLoginApi = (data: {
  email?: string;
  phone?: string;
  password: string;
  loginType?: string;
}) => {
  return apiClient.post<any>("/api/user/login", data);
};

// Set User Password (Initial Registration flow)
export const setUserPasswordApi = (userId: string, data: any) => {
  return apiClient.post<any>(`/api/user/register/set-password/${userId}`, data);
};

// Forgot Password - Send OTP (Email or Phone)
export const forgotPasswordSendOtpApi = (data: { email?: string; phone?: string }) => {
  return apiClient.post<any>("/api/user/forgot-password/send-otp", data);
};

// OTP Verification (Registration/Login)
export const verifyOtpApi = (data: {
  email?: string;
  phone?: string;
  otp: string;
  loginType?: string;
}) => {
  return apiClient.post<any>("/api/user/verify-otp", data);
};

// Forgot Password - Verify OTP
export const forgotPasswordVerifyOtpApi = (data: { email?: string; phone?: string; otp: string }) => {
  return apiClient.post<any>("/api/user/forgot-password/verify-otp", data);
};

// Forgot Password - Reset Password (OTP required)
export const forgotPasswordResetApi = (
  userId: string,
  data: { otp: string; newPassword: string },
) => {
  return apiClient.post<any>(`/api/user/forgot-password/reset/${userId}`, data);
};

// Verify User Token (Alternative flow)
export const verifyUserApi = (data: { token: string }) => {
  return apiClient.post<any>("/api/auth/verify-user", data);
};
