import { TOKEN, USER_ID } from "../pages/Common/constant.function";
import { apiClient } from "./api";

export interface UploadImageResponse {
  url: string;
  key: string;
}

export const uploadImageAPI = async (
  file: File,
): Promise<UploadImageResponse> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("entity", "ads");
  formData.append("userId", USER_ID ?? "");

  return apiClient.post<any>("/api/post/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
