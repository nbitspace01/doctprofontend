import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  App,
  message,
  UploadProps,
  Image,
  Upload,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../Common/axiosInstance";
import { showError, showSuccess } from "../../Common/Notification";
import { createDegreeApi, updateDegreeApi } from "../../../api/degree.api";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import { UserOutlined } from "@ant-design/icons";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
  status: string;
  created_at: string;
}

interface DegreeAddModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: DegreeData | null;
}

interface DegreeFormValues {
  name: string;
  specialization: string;
}

const DegreeAddModal: React.FC<DegreeAddModalProps> = ({
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
      // setImageUrl(initialData.profile_image || "");
      form.setFieldsValue({
        ...initialData,
        specialization: initialData.specialization,
      });
    } else {
      setImageUrl("");
      form.resetFields();
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: DegreeFormValues) =>
      createDegreeApi({
        ...values,
        specialization: values.specialization.toLowerCase(),
      }),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Degree Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to create degree",
        description: error.response?.data?.error || "Failed to create degree",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: DegreeFormValues) => {
      const payload: any = {
        ...values,
        specialization: values.specialization.toLowerCase(),
        profile_image: imageUrl,
      };

      return updateDegreeApi(initialData!.id, payload);
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Degree Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to update degree",
        description: error.response?.error || "Failed to update degree",
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = (values: DegreeFormValues) => {
    isEditMode ? updateMutation.mutate(values) : createMutation.mutate(values);
  };

  return (
    <Modal
      title={isEditMode ? "Edit Degree" : "Create New Degree"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex justify-center mb-6">
          <Upload {...uploadProps} key={initialData?.id || "new"}>
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  preview={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserOutlined className="text-3xl text-gray-400" />
              )}
            </div>
          </Upload>
        </div>
        <Form.Item
          name="name"
          label="Degree Name"
          rules={[
            { required: true, message: "Please enter degree name" },
            {
              pattern: /^[a-zA-Z\s]+$/,
              message: "Degree name cannot contain numbers",
            },
          ]}
        >
          <Input placeholder="Enter Degree Name" />
        </Form.Item>

        <Form.Item
          name="specialization"
          label="Specializations"
          rules={[{ required: true, message: "Please enter specializations" }]}
        >
          <Input.TextArea placeholder="Enter Specializations" rows={4} />
        </Form.Item>

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
      </Form>
    </Modal>
  );
};

export default DegreeAddModal;
