import React, { useEffect, useState } from "react";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
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

import { TOKEN, USER_ID } from "../Common/constant.function";
import { showError, showSuccess } from "../Common/Notification";
import PhoneNumberInput from "../Common/PhoneNumberInput";
import api from "../Common/axiosInstance";
import { SubAdminRegister, SubAdminUpdate } from "../../api/admin.api";
import { getCountries, getStates, getDistricts } from "../../api/location.api";
import { strongPasswordValidator } from "../../utils/password.validator";

/* -------------------- Types -------------------- */
interface SubAdminData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  active_user: boolean;
  role: string;
  organization_type: string;
  location?: string;
  associated_location?: string;
  state?: string;
  district?: string;
  state_id?: string;
  district_id?: string;
  profile_image?: string;
}

interface AddSubAdminModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: SubAdminData | null;
}

interface SubAdminFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  organization_type: string;
  state: string;
  district: string;
  password: string;
  confirmPassword: string;
  profile_image?: string;
}

/* -------------------- Constants -------------------- */
const ROLE_OPTIONS = [{ value: "subadmin", label: "Sub Admin" }];

const ORGANIZATION_OPTIONS = [
  { value: "Hospital", label: "Hospital" }
];

/* -------------------- Component -------------------- */
const AddSubAdminModal: React.FC<AddSubAdminModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const isEditMode = Boolean(initialData);

  /* -------------------- Location Logic -------------------- */
  const [states, setStates] = useState<any[]>([]);
  const [districts, setdistricts] = useState<any[]>([]);

  // Fetch Initial Data (India -> States)
  useEffect(() => {
    const initLocations = async () => {
      try {
        const countries = await getCountries();
        const india = countries.find(
          (c: any) => c.code === "IN" || c.name === "India",
        );
        if (india) {
          const stateData = await getStates(india.id);
          // Store ID as 'key' or in 'data-id' if Select allows, OR just Map id in value?
          // Antd Select options: { label, value, ...extra }
          setStates(
            stateData.map((s: any) => ({
              label: s.name,
              value: s.id,
              name: s.name,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load locations", error);
      }
    };
    if (open) initLocations();
  }, [open]);

  const handleStateChange = async (stateId: string) => {
    try {
      if (!stateId) return;

      const cityData = await getDistricts(stateId);
      setdistricts(cityData.map((c: any) => ({ label: c.name, value: c.id })));
      form.setFieldValue("district", undefined);
    } catch (error) {
      console.error("Failed to load districts", error);
    }
  };

  /* -------------------- Upload Config -------------------- */
  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      if (file.size / 1024 / 1024 >= 2) {
        message.error("Image must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }
      setPendingFile(file as File);
      setImageUrl(URL.createObjectURL(file as File));
      return false; // prevent auto-upload
    },
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setImageUrl(initialData.profile_image || "");
      setPendingFile(null);
      const initialStateId = initialData.state_id || initialData.state || "";
      const initialDistrictId =
        initialData.district_id || initialData.district || "";
      form.setFieldsValue({
        ...initialData,
        state: initialStateId,
        district: initialDistrictId,
      });
      if (initialStateId) {
        getDistricts(initialStateId)
          .then((cityData) => {
            setdistricts(
              cityData.map((c: any) => ({ label: c.name, value: c.id })),
            );
          })
          .catch((error) => {
            console.error("Failed to load districts", error);
          });
      }
    } else {
      setImageUrl("");
      setPendingFile(null);
      form.resetFields();
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: SubAdminFormValues) => SubAdminRegister(values),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Sub-admin Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      const apiMsg =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create sub-admin";
      showError(notification, {
        message: "Failed to create sub-admin",
        description: apiMsg,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: SubAdminFormValues) =>
      SubAdminUpdate(initialData!.id, values),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Sub-admin Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      const apiMsg =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update sub-admin";
      showError(notification, {
        message: "Failed to update sub-admin",
        description: apiMsg,
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = (values: SubAdminFormValues) => {
    const formData = new FormData();

    // Text fields
    Object.entries(values).forEach(([key, value]) => {
      if (key === "state" || key === "district") return;
      if (value) {
        formData.append(key, value as string);
      }
    });

    // File (ONLY if selected)
    if (pendingFile) {
      formData.append("profile_picture", pendingFile);
    }

    // Normalize
    formData.set("organization_type", values.organization_type.toLowerCase());
    if (values.state) formData.set("stateId", values.state);
    if (values.district) formData.set("districtId", values.district);

    // Password handling (edit)
    if (!values.password) {
      formData.delete("password");
      formData.delete("confirmPassword");
    }

    isEditMode
      ? updateMutation.mutate(formData as any)
      : createMutation.mutate(formData as any);
  };

  /* -------------------- Render -------------------- */
  return (
    <Modal
      title={isEditMode ? "Edit Sub Admin" : "Create New Sub-Admin"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="flex justify-center mb-6">
          <Upload
            {...uploadProps}
            key={initialData?.id || "new"}
            showUploadList={false}
          >
            <div className="relative group w-24 h-24 cursor-pointer">
              {/* Avatar / Image */}
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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

              {/* Hover Overlay */}
              <div
                className="
          absolute inset-0 rounded-full
          bg-black/50 opacity-0
          group-hover:opacity-100
          flex items-center justify-center
          transition-opacity
        "
              >
                <UploadOutlined className="text-white text-xl" />
              </div>
            </div>
          </Upload>
        </div>

        <Form.Item
          name="first_name"
          label="First Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter First Name" />
        </Form.Item>

        <Form.Item
          name="last_name"
          label="Last Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter Last Name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[{ required: true }, { type: "email" }]}
        >
          <Input placeholder="Enter Email Address" />
        </Form.Item>

        <PhoneNumberInput name="phone" label="Phone Number" />

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} placeholder="Select Role" />
          </Form.Item>

          <Form.Item
            name="organization_type"
            label="Organization Type"
            rules={[{ required: true }]}
          >
            <Select
              options={ORGANIZATION_OPTIONS}
              placeholder="Select Organization Type"
            />
          </Form.Item>
        </div>

        <Form.Item name="state" label="State" rules={[{ required: true }]}>
          <Select
            placeholder="Select State"
            options={states}
            onChange={(value, option) => {
              handleStateChange(value, option);
            }}
          />
        </Form.Item>

        <Form.Item
          name="district"
          label="City / District"
          rules={[{ required: true }]}
        >
          <Select
            options={districts}
            showSearch
            placeholder="Select City / District"
          />
        </Form.Item>

        <div className="border-t pt-4 mt-4">
          <Form.Item
            name="password"
            label="New Password"
            rules={
              isEditMode
                ? [{ min: 8 }]
                : [
                    { required: true },
                    { min: 8 },
                    { validator: strongPasswordValidator() },
                  ]
            }
          >
            <Input.Password placeholder="Enter New Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
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
            <Input.Password placeholder="Confirm New Password" />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={
              uploading || createMutation.isPending || updateMutation.isPending
            }
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddSubAdminModal;
