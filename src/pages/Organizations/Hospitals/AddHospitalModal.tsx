import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Switch,
  Upload,
  UploadProps,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import { showSuccess } from "../../Common/Notification";
import { ApiHospitalData } from "../Hospital.types";
import { apiClient } from "../../../api/api";

// Define the props interface
interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ApiHospitalData | null;
  onUpdate: (data: Partial<ApiHospitalData>) => void;
  isEditing: boolean;
}

const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onUpdate,
  isEditing,
}) => {
  const [form] = Form.useForm();
  const [hospitalData, setHospitalData] = useState<{
    name: string;
    branchLocation: string;
    isHeadBranch: boolean;
    logoUrl: string | null;
    isActive: boolean;
  }>({
    name: "",
    branchLocation: "",
    isHeadBranch: false,
    logoUrl: null,
    isActive: true,
  });
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (isEditing && initialData) {
      const formValues = {
        name: initialData.name,
        branchLocation: initialData.branchLocation,
        isHeadBranch: initialData.isHeadBranch,
        logoUrl: initialData.logoUrl,
        // add other fields as needed
      };
      form.setFieldsValue(formValues);
      setHospitalData({
        name: initialData.name,
        branchLocation: initialData.branchLocation,
        isHeadBranch: initialData.isHeadBranch,
        logoUrl: initialData.logoUrl,
        isActive: initialData.isActive,
      });
      // Set the image URL for display if editing
      setImageUrl(initialData.logoUrl || "");
    } else {
      form.resetFields();
      const emptyData = {
        name: "",
        branchLocation: "",
        isHeadBranch: false,
        logoUrl: null,
        isActive: true,
      };
      setHospitalData(emptyData);
      setImageUrl(""); // Reset image URL when not editing
    }
  }, [isEditing, initialData, isOpen, form]);

  console.log(uploading, "uploading");

  const createHospital = async (values: Partial<ApiHospitalData>) => {
    const response = await apiClient.post<any>(`/api/hospital`, values);
    if (!response.ok) throw new Error("Failed to add hospital");
    return response.json();
  };

  const updateHospital = async (values: Partial<ApiHospitalData>) => {
    onUpdate(values);
    return { message: "Hospital updated successfully" };
  };

  const handleSubmit = async (values: Partial<ApiHospitalData>) => {
    try {
      // Include the logoUrl from hospitalData in the submission
      const submissionData = {
        ...values,
        logoUrl: hospitalData.logoUrl,
      };

      const handler = isEditing ? updateHospital : createHospital;
      const data = await handler(submissionData);
      showSuccess(notification, {
        message: isEditing
          ? "Hospital updated successfully"
          : "Hospital added successfully",
        description: data.message,
      });
      onSuccess();
      // Close modal for both new hospital creation and updates
      handleClose();
    } catch (error) {
      console.error("Error handling hospital:", error);
      notification.error({
        message: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} hospital`,
      });
    }
  };

  // Add this function to handle form reset
  const handleClose = () => {
    // Reset both form and state to initial empty values
    const emptyData = {
      name: "",
      branchLocation: "",
      isHeadBranch: false,
      logoUrl: null,
      isActive: true,
    };

    setHospitalData(emptyData);
    setImageUrl(""); // Reset image URL
    form.setFieldsValue(emptyData);
    form.resetFields();
    onClose();
  };

  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file as File);
        formData.append("entity", "post");
        formData.append("userId", USER_ID || "");

        const response = await axios.post(
          `${API_URL}/api/post/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${TOKEN}`,
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.({ percent });
              }
            },
          }
        );

        const { url } = response.data;

        setImageUrl(url || "");

        form.setFieldsValue({ logoUrl: url });
        setHospitalData((prev) => ({ ...prev, logoUrl: url }));

        onSuccess?.(response.data);
        message.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        onError?.(error as Error);
        message.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
  };

  return (
    <Modal
      title={isEditing ? "Edit Hospital" : "Add Hospital"}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="rounded-lg"
      forceRender
    >
      {/* <Form form={form} initialValues={hospitalData} onFinish={handleSubmit}> */}
      <Form form={form} onFinish={handleSubmit}>
        <div className="space-y-6 py-4">
          {/* Logo Upload Section */}
          <div className="flex justify-center">
            <Upload {...uploadProps}>
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Hospital logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-center text-gray-400">
                    Logo here
                  </span>
                )}
              </div>
            </Upload>
          </div>
          {/* <p className="text-center text-gray-500">Logo here</p> */}

          {/* Hospital/Clinic Name */}
          <Form.Item
            name="name"
            label="Hospital/Clinic Name"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Enter Hospital Name"
              onChange={(e) =>
                setHospitalData({ ...hospitalData, name: e.target.value })
              }
            />
          </Form.Item>

          {/* Branch Location */}
          <Form.Item
            name="branchLocation"
            label="Branch Location"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Location"
              onChange={(value) =>
                setHospitalData({ ...hospitalData, branchLocation: value })
              }
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
                { value: "Assam", label: "Assam" },
                { value: "Bihar", label: "Bihar" },
                { value: "Chhattisgarh", label: "Chhattisgarh" },
                { value: "Goa", label: "Goa" },
                { value: "Gujarat", label: "Gujarat" },
                { value: "Haryana", label: "Haryana" },
                { value: "Himachal Pradesh", label: "Himachal Pradesh" },
                { value: "Jharkhand", label: "Jharkhand" },
                { value: "Karnataka", label: "Karnataka" },
                { value: "Kerala", label: "Kerala" },
                { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                { value: "Maharashtra", label: "Maharashtra" },
                { value: "Manipur", label: "Manipur" },
                { value: "Meghalaya", label: "Meghalaya" },
                { value: "Mizoram", label: "Mizoram" },
                { value: "Nagaland", label: "Nagaland" },
                { value: "Odisha", label: "Odisha" },
                { value: "Punjab", label: "Punjab" },
                { value: "Rajasthan", label: "Rajasthan" },
                { value: "Sikkim", label: "Sikkim" },
                { value: "Tamil Nadu", label: "Tamil Nadu" },
                { value: "Telangana", label: "Telangana" },
                { value: "Tripura", label: "Tripura" },
                { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                { value: "Uttarakhand", label: "Uttarakhand" },
                { value: "West Bengal", label: "West Bengal" },
                { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
                { value: "Chandigarh", label: "Chandigarh" },
                { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
                { value: "Delhi", label: "Delhi" },
                { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
                { value: "Ladakh", label: "Ladakh" },
                { value: "Lakshadweep", label: "Lakshadweep" },
                { value: "Puducherry", label: "Puducherry" },
              ]}
            />
          </Form.Item>

          {/* Head Branch Toggle */}
          <Form.Item name="isHeadBranch" label="Head Branch">
            <Switch
              onChange={(checked) =>
                setHospitalData({ ...hospitalData, isHeadBranch: checked })
              }
            />
          </Form.Item>

          {/* Hidden field for logoUrl */}
          <Form.Item name="logoUrl" hidden>
            <Input />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={handleClose}
              className="px-8 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-8 py-2  text-white bg-button-primary hover:!bg-button-primary"
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddHospitalModal;
