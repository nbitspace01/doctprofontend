// import { useState } from "react";
// import { uploadImageAPI } from "../api/upload.api";

// export const useImageUpload = () => {
//   const [uploading, setUploading] = useState(false);

//   const uploadImage = async (file: File): Promise<string> => {
//     try {
//       setUploading(true);
//       return await uploadImageAPI(file);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return { uploadImage, uploading };
// };
