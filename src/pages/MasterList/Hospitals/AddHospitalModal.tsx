import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Switch,
} from "antd";

import {
  createHospitalApi,
  updateHospitalApi,
} from "../../../api/hospital.api";
import { showError, showSuccess } from "../../Common/Notification";

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

  const isEditMode = Boolean(initialData);

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        branchLocation: initialData.branchLocation,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: HospitalFormValues) =>
      createHospitalApi({
        ...values,
        branchLocation: values.branchLocation.toLowerCase(),
      }),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Hospital Created Successfully",
        description: data.message,
      });
      form.resetFields();
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
