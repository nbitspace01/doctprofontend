import { UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import type { UploadProps } from "antd";
import {
  App,
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Upload,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { TOKEN, USER_ID } from "../Common/constant.function";
import { showError, showSuccess } from "../Common/Notification";
import PhoneNumberInput from "../Common/PhoneNumberInput";

interface HospitalAdminData {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  status: string;
  active_user: boolean;
  role: string;
  organization_type: string;
  location?: string;
  associated_location?: string;
  profile_image?: string;
  state?: string;
  district?: string;
  name?: string;
  image_url?: string;
}

interface AddHospitalAdminModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: HospitalAdminData | null;
}

interface HospitalAdminFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  organization_type: string;
  location: string;
  associated_location: string;
  password: string;
  confirmPassword: string;
  profile_image?: string;
  State?: string;
  Districts?: string;
}

const AddHospitalAdminModal: React.FC<AddHospitalAdminModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { notification } = App.useApp();

  const roleOptions = [
    { value: "subadmin", label: "Sub Admin" },
    { value: "hospital-admin", label: "Hospital Admin" }
  ];

  const organizationOptions = [
    { value: "Hospital", label: "Hospital" },
    { value: "College", label: "College" },
    { value: "University", label: "University" },
    { value: "Institute", label: "Institute" },
    { value: "Training Center", label: "Training Center" },
  ];

  const stateOptions = [
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
  ];

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
        console.log(url, "url");
        form.setFieldsValue({ profile_image: url });

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

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Set the image URL state first
        setImageUrl(initialData.profile_image || "");

        // Split the full name into first and last name
        // Handle both first_name/last_name and name fields
        let firstName = initialData.first_name || "";
        let lastName = initialData.last_name || "";
        
        // If name exists but first_name/last_name don't, split the name
        if (!firstName && !lastName && initialData.name) {
          const nameParts = initialData.name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        } else if (!firstName && initialData.first_name) {
          // If first_name exists as a full name, split it
          const nameParts = initialData.first_name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        form.setFieldsValue({
          first_name: firstName,
          last_name: lastName,
          email: initialData.email,
          phone: initialData.phone,
          role: initialData.role,
          organization_type: initialData.organization_type,
          location: initialData.location || "",
          associated_location: initialData.associated_location || initialData.location || "",
          status: initialData.status,
          profile_image: initialData.profile_image,
          State: initialData.state || "",
          Districts: initialData.district || "",
        });
      } else {
        setImageUrl("");
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  // Separate useEffect to handle imageUrl updates
  useEffect(() => {
    if (initialData?.profile_image) {
      setImageUrl(initialData.profile_image);
    }
  }, [initialData?.profile_image]);

  const createHospitalAdminMutation = useMutation({
    mutationFn: (values: HospitalAdminFormValues) => {
      const payload = {
        name: values.first_name + " " + values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        organization_type: values.organization_type.toLowerCase(),
        role: values.role,
        location: values.location,
        associated_location: values.associated_location,
        profile_picture: imageUrl || "",
        state: values.State || "",
        district: values.Districts || "",
      };

      console.log("Create payload:", payload);

      return axios.post(`${API_URL}/api/user/create-hospital-admin`, payload, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Hospital Admin Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ?? "Failed to create hospital admin";
      showError(notification, {
        message: "Failed to create hospital admin",
        description: errorMessage,
      });
    },
  });

  const updateHospitalAdminMutation = useMutation({
    mutationFn: (values: HospitalAdminFormValues) => {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        organization_type: values.organization_type,
        role: values.role,
        location: values.location,
        associated_location: values.associated_location,
        profile_picture: imageUrl || "",
        state: values.State || "",
        district: values.Districts || "",
      };

      console.log("Update payload:", payload);

      return axios.put(
        `${API_URL}/api/user/hospital-admin/${initialData?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Hospital Admin Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.error ?? "Failed to update hospital admin";
      showError(notification, {
        message: "Failed to update hospital admin",
        description: errorMessage,
      });
    },
  });

  const handleSubmit = (values: HospitalAdminFormValues) => {
    console.log("Form values:", values);
    console.log("Profile image value:", values.profile_image);
    console.log("Image URL state:", imageUrl);

    if (initialData) {
      updateHospitalAdminMutation.mutate(values);
    } else {
      createHospitalAdminMutation.mutate(values);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Hospital Admin" : "Create New Hospital Admin"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex justify-center mb-6">
          <Upload {...uploadProps} key={initialData?.id || "new"}>
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  preview={false}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImageUrl("")}
                />
              ) : (
                <UserOutlined className="text-3xl text-gray-400" />
              )}
            </div>
          </Upload>
          {uploading && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Uploading...
            </div>
          )}
        </div>

        <Form.Item name="profile_image" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: "Please enter first name" }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: "Please enter last name" }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <PhoneNumberInput name="phone" label="Phone Number" />

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select Role" options={roleOptions} />
          </Form.Item>

          <Form.Item
            label="Organization Type"
            name="organization_type"
            rules={[
              { required: true, message: "Please select organization type" },
            ]}
          >
            <Select placeholder="Select Type" options={organizationOptions} />
          </Form.Item>
        </div>

        <Form.Item
          label="State"
          name="State"
          rules={[{ required: true, message: "Please select State" }]}
        >
          <Select 
            placeholder="Select State" 
            options={stateOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Districts"
          name="Districts"
          rules={[
            { required: true, message: "Please enter Districts" },
          ]}
        >
          <Input placeholder="Enter Districts" />
        </Form.Item>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-base font-medium mb-4">Password Creation</h3>
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: "Please enter password" },
              {
                min: 8,
                message: "Password must be at least 8 characters long",
              },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600"
            loading={
              initialData
                ? updateHospitalAdminMutation.isPending
                : createHospitalAdminMutation.isPending
            }
            disabled={
              initialData
                ? updateHospitalAdminMutation.isPending
                : createHospitalAdminMutation.isPending
            }
          >
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddHospitalAdminModal;
