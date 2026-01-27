import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  App,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { showError, showSuccess } from "../../Common/Notification";
import { createDegreeApi, updateDegreeApi } from "../../../api/degree.api";

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

  const isEditMode = Boolean(initialData);

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        specialization: initialData.specialization,
      });
    } else {
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
      };

      return updateDegreeApi(initialData!.id, payload);
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Degree Updated Successfully",
        description: data.message,
      });
      form.resetFields();
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
