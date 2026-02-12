import axiosInstance from "./axiosInstance";
import { getToken } from "./authUtils";

export const TITLE = "Doctpro";
export const TOKEN = getToken();
export const userRole = localStorage.getItem("roleName") || null;
export const USER_ID = localStorage.getItem("userId");
export const FIRST_NAME = localStorage.getItem("firstName");
export const LAST_NAME = localStorage.getItem("lastName");
export const USER_NAME = `${FIRST_NAME} ${LAST_NAME}`;
export const ApiRequest = axiosInstance;
