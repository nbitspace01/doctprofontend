import axiosInstance from "./axiosInstance";

export const TITLE = "Doctpro";
export const TOKEN = localStorage.getItem("userToken");
export const ApiRequest = axiosInstance;
