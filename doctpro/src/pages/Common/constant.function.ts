import axiosInstance from "./axiosInstance";

export const TITLE = "Doctpro";
export const TOKEN = localStorage.getItem("userToken");
export const USER_ID = localStorage.getItem("userId");
export const ApiRequest = axiosInstance;
