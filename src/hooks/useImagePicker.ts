import { useState } from "react";
import { Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

/* Prevent real upload */
const dummyRequest: UploadProps["customRequest"] = ({ onSuccess }) => {
  setTimeout(() => onSuccess?.("ok"), 0);
};

export const useImagePicker = (maxSizeMB = 2) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: "image/*",
    customRequest: dummyRequest,

    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size < maxSizeMB * 1024 * 1024;

      if (!isImage) {
        message.error("Only image files allowed");
        return Upload.LIST_IGNORE;
      }

      if (!isValidSize) {
        message.error(`Image must be smaller than ${maxSizeMB}MB`);
        return Upload.LIST_IGNORE;
      }

      return true; // add to list only
    },

    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
  };

  const getFile = (): File | null =>
    (fileList[0]?.originFileObj as File) || null;

  const reset = () => setFileList([]);

  return { uploadProps, getFile, reset };
};
