import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { UploadProps } from "antd";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Upload,
  message,
} from "antd";

import {
  createHospitalApi,
  updateHospitalApi,
} from "../../../api/hospital.api";
import { showError, showSuccess } from "../../Common/Notification";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import api from "../../Common/axiosInstance";

/* -------------------- Types -------------------- */
interface HospitalData {
  id: string;
  name: string;
  logoUrl: string | null;
  branchLocation: string;
  status: string;
  updated_at: string;
}

interface AddHospitalModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: HospitalData | null;
}

interface HospitalFormValues {
  name: string;
  logoUrl: string | null;
  branchLocation: string;
}

/* -------------------- Constants -------------------- */
const STATE_OPTIONS = [
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
  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
  },
  { value: "Chandigarh", label: "Chandigarh" },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "Delhi", label: "Delhi" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Puducherry", label: "Puducherry" },
];

const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const isEditMode = Boolean(initialData);

  /* -------------------- Upload Config -------------------- */
  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error("You can only upload image files!");
        return false;
      }
      if (file.size / 1024 / 1024 >= 2) {
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

        const response = await api.post(`/api/post/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${TOKEN}`,
          },
          onUploadProgress: (e) => {
            if (e.total) {
              onProgress?.({
                percent: Math.round((e.loaded * 100) / e.total),
              });
            }
          },
        });

        const { url } = response.data;
        setImageUrl(url || "");
        form.setFieldsValue({ profile_image: url });

        onSuccess?.(response.data);
        message.success("Image uploaded successfully!");
      } catch (error) {
        onError?.(error as Error);
        message.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setImageUrl(initialData.logoUrl || "");
      form.setFieldsValue({
        ...initialData,
        branchLocation: initialData.branchLocation,
      });
    } else {
      setImageUrl("");
      form.resetFields();
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: HospitalFormValues) =>
      createHospitalApi({
        ...values,
        branchLocation: values.branchLocation.toLowerCase(),
        profile_image: imageUrl,
      }),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Hospital Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to create hospital",
        description:
          error.response?.data?.error || "Failed to create hospital",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: HospitalFormValues) => {
      const payload: any = {
        ...values,
        branchLocation: values.branchLocation.toLowerCase(),
        profile_image: imageUrl,
      };

      // if (!values.password) {
      //   delete payload.password;
      //   delete payload.confirmPassword;
      // }

      return updateHospitalApi(initialData!.id, payload);
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Hospital Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to update hospital",
        description: error.response?.error || "Failed to update hospital",
      });
    },
  });

  //* -------------------- Submit -------------------- */
  const handleSubmit = (values: HospitalFormValues) => {
    isEditMode ? updateMutation.mutate(values) : createMutation.mutate(values);
  };

  return (
    <Modal
      title={isEditMode ? "Edit Hospital" : "Create New Hospital"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} onFinish={handleSubmit}>
        <div className="space-y-6 py-4">
          {/* Logo Upload Section */}
          <div className="flex justify-center">
            <Upload {...uploadProps} key={initialData?.id || "new"}>
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

          {/* Hospital/Clinic Name */}
          <Form.Item
            name="name"
            label="Hospital/Clinic Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {/* Branch Location */}
          <Form.Item
            name="branchLocation"
            label="Branch Location"
            rules={[{ required: true }]}
          >
            <Select options={STATE_OPTIONS} />
          </Form.Item>

          {/* Head Branch Toggle */}
          <Form.Item
            name="isHeadBranch"
            label="Head Branch"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Hidden field for logoUrl */}
          <Form.Item name="logoUrl" hidden>
            <Input />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddHospitalModal;
