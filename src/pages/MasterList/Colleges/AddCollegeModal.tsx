import React, { useEffect, useState } from "react";
import {
  Modal,
  Select,
  Form,
  Input,
  Button,
  message,
  UploadProps,
  Upload,
  Image,
  App,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHospitalListApi } from "../../../api/hospital.api";
import { createCollegeApi, updateCollegeApi } from "../../../api/college.api";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import api from "../../Common/axiosInstance";
import { showError, showSuccess } from "../../Common/Notification";
import { UserOutlined } from "@ant-design/icons";

/* ---------- TYPES ---------- */
export interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  name: string;
  state: string;
  district: string;
  hospitals: any[];
  created_at: string;
  status: "active" | "pending" | "inactive";
}

interface AddCollegeModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: CollegeData | null;
}

interface CollegeFormValues {
  name: string;
  city: string;
  district: string;
  state: string;
  hospitalIds: string[];
}

interface Hospital {
  id: string;
  name: string;
}

/* -------------------- Constants -------------------- */
export const STATE_OPTIONS = [
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
];

export const DISTRICT_OPTIONS = [
  { label: "Chennai", value: "Chennai" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Madurai", value: "Madurai" },
  { label: "Salem", value: "Salem" },
  { label: "Erode", value: "Erode" },
  { label: "Thanjavur", value: "Thanjavur" },
  { label: "Tiruchirappalli", value: "Tiruchirappalli" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Mysore", value: "Mysore" },
  { label: "Mangalore", value: "Mangalore" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Warangal", value: "Warangal" },
  { label: "Secunderabad", value: "Secunderabad" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Pune", value: "Pune" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Surat", value: "Surat" },
  { label: "Vadodara", value: "Vadodara" },
  { label: "Jaipur", value: "Jaipur" },
  { label: "Jodhpur", value: "Jodhpur" },
  { label: "Udaipur", value: "Udaipur" },
  { label: "Lucknow", value: "Lucknow" },
  { label: "Kanpur", value: "Kanpur" },
  { label: "Varanasi", value: "Varanasi" },
  { label: "Patna", value: "Patna" },
  { label: "Gaya", value: "Gaya" },
  { label: "Ranchi", value: "Ranchi" },
  { label: "Jamshedpur", value: "Jamshedpur" },
  { label: "Bhopal", value: "Bhopal" },
  { label: "Indore", value: "Indore" },
  { label: "Gwalior", value: "Gwalior" },
  { label: "Thiruvananthapuram", value: "Thiruvananthapuram" },
  { label: "Kochi", value: "Kochi" },
  { label: "Kozhikode", value: "Kozhikode" },
  { label: "Shillong", value: "Shillong" },
  { label: "Gangtok", value: "Gangtok" },
  { label: "Imphal", value: "Imphal" },
  { label: "Agartala", value: "Agartala" },
];

/* -------------------- Component -------------------- */
const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
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

  /* -------------------- QUERY -------------------- */
  const { data: hospitalResponse, isFetching } = useQuery({
    queryKey: ["colleges"],
    queryFn: fetchHospitalListApi,
  });

  const hospitals: Hospital[] = hospitalResponse ?? [];

  const hospitalOptions = hospitals.map((h) => ({
    label: h.name,
    value: h.id,
  }));

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open || !initialData || !hospitalOptions.length) return;

    if (initialData) {
      setImageUrl(initialData.logo || "");
      form.setFieldsValue({
        ...initialData,
        state: initialData.state || "",
        district: initialData.district || "",
        hospitalIds: initialData.hospitals.map((h) => h.id) || []
      });
    } else {
      setImageUrl("");
      form.resetFields();
    }
  }, [open, initialData, hospitalOptions, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: CollegeFormValues) =>
      createCollegeApi({
        ...values,
        city: values.city.toLowerCase(),
        district: values.district.toLowerCase(),
        state: values.state.toLowerCase(),
        profile_image: imageUrl,
      }),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "College Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to college",
        description: error.response?.data?.error || "Failed to create college",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CollegeFormValues) => {
      console.log("Update Mutation: ",values);
      const payload: any = {
        ...values,
        city: values.city.toLowerCase(),
        district: values.district.toLowerCase(),
        state: values.state.toLowerCase(),
        profile_image: imageUrl,
      };

      return updateCollegeApi(initialData!.id, payload);
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "College Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setImageUrl("");
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to update college",
        description: error.response?.error || "Failed to update college",
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = (values: CollegeFormValues) => {
    isEditMode ? updateMutation.mutate(values) : createMutation.mutate(values);
  };

  if (!open) return null;

  return (
    <Modal
      title={isEditMode ? "Edit College" : "Add New College"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
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

        <Form.Item name="profile_image" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label="College Name"
          name="name"
          rules={[{ required: true, message: "Please enter college name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="City / Town"
          name="city"
          rules={[{ required: true, message: "Please enter city" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="District"
          name="district"
          rules={[{ required: true, message: "Please select district" }]}
        >
          <Select options={DISTRICT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="State"
          name="state"
          rules={[{ required: true, message: "Please select state" }]}
        >
          <Select options={STATE_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Associated Hospital"
          name="hospitalIds"
          rules={[{ required: true, message: "Please select hospital" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select hospitals"
            options={hospitalOptions}
            loading={isFetching}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
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

export default AddCollegeModal;
