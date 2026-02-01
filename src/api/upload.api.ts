import { TOKEN, USER_ID } from "../pages/Common/constant.function";
import { apiClient } from "./api";

export interface UploadImageResponse {
  url: string;
  key: string;
}

export const uploadImageAPI = async (
  file: File,
  userIdOverride?: string
): Promise<UploadImageResponse> => {
  const formData = new FormData();

  const finalUserId = userIdOverride || localStorage.getItem("userId") || "";

  formData.append("file", file);
  formData.append("entity", "ads");
  formData.append("userId", finalUserId);

  return apiClient.post<any>("/api/post/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
