// Authentication utility functions using localStorage

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("userToken");
  return !!token;
};

export const getToken = (): string | null => {
  return localStorage.getItem("userToken");
};

export const getUserInfo = () => {
  return {
    userId: localStorage.getItem("userId"),
    roleId: localStorage.getItem("roleId"),
    roleName: localStorage.getItem("roleName"),
    firstName: localStorage.getItem("firstName"),
    lastName: localStorage.getItem("lastName"),
    email: localStorage.getItem("userEmail"),
  };
};

export const clearAuthData = (): void => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("roleId");
  localStorage.removeItem("roleName");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  localStorage.removeItem("userEmail");
};

export const setAuthData = (data: {
  token: string;
  user: {
    id: string;
    role: { id: string; name: string };
    first_name: string;
    last_name: string;
  };
}): void => {
  localStorage.setItem("userToken", data.token);
  localStorage.setItem("userId", data.user.id);
  localStorage.setItem("roleId", data.user.role.id);
  localStorage.setItem("roleName", data.user.role.name);
  localStorage.setItem("firstName", data.user.first_name);
  localStorage.setItem("lastName", data.user.last_name);
};

export const checkAndRedirectIfNotAuth = (): boolean => {
  if (!isAuthenticated()) {
    clearAuthData();
    window.location.href = "/auth/login";
    return false;
  }
  return true;
};
