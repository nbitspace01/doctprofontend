import axiosInstance from "./axiosInstance";

export const TITLE = "Doctpro";
export const TOKEN = localStorage.getItem("userToken");
export const USER_ID = localStorage.getItem("userId");
export const FIRST_NAME = localStorage.getItem("firstName");
export const LAST_NAME = localStorage.getItem("lastName");
export const USER_NAME = `${FIRST_NAME} ${LAST_NAME}`;
export const ApiRequest = axiosInstance;
