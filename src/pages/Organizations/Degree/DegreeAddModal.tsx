import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, App } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { showError, showSuccess } from "../../Common/Notification";

interface DegreeData {
  id: string;
  name: string;
  graduation_level: string;
  specialization: string;
}
interface DegreeAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  initialValues?: DegreeData | null;
}

interface DegreePayload {
  name: string;
  graduation_level: string;
  specialization: string;
}

const DegreeAddModal: React.FC<DegreeAddModalProps> = ({
  isOpen,
  onClose,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const createDegreeMutation = useMutation({
    mutationFn: async (data: DegreePayload) => {
      try {
        if (initialValues) {
          const response = await axios.put(
            `${API_URL}/api/degree/${initialValues.id}`,
            data
          );
          return response.data;
        }
        const response = await axios.post(`${API_URL}/api/degree`, data);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      showSuccess(notification, {
        message: initialValues
          ? "Degree Updated Successfully"
          : "Degree Created Successfully",
        description: data.message ?? "Operation completed successfully",
      });

      // Reset and close
      form.resetFields();
      onClose();

      // Refresh the data
      queryClient.invalidateQueries({
        queryKey: ["degreeSpecialization"],
      });
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Operation Failed",
        description:
          error?.response?.data?.message ??
          error.message ??
          "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        degreeName: initialValues.name,
        graduationLevel: initialValues.graduation_level,
        specializations: initialValues.specialization,
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: DegreePayload = {
        name: values.degreeName,
        graduation_level: values.graduationLevel,
        specialization: values.specializations,
      };
      createDegreeMutation.mutate(payload);
    });
  };

  return (
    <Modal
      title={
        initialValues
          ? "Edit Degree & Specialization"
          : "Add New Degree & Specialization"
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="max-w-2xl"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="degreeName"
          label="Degree Name"
          rules={[
            { required: true, message: "Please enter degree name" },
            {
              pattern: /^[a-zA-Z\s]+$/,
              message: "Degree name cannot contain numbers",
            },
          ]}
        >
          <Input
            placeholder="Enter Degree Name"
            className="w-full rounded-md"
          />
        </Form.Item>

        <Form.Item
          name="graduationLevel"
          label="Graduation Level"
          rules={[
            { required: true, message: "Please select graduation level" },
          ]}
        >
          <Select
            placeholder="Select Graduation Level"
            className="w-full"
            options={[
              { value: "bachelor", label: "Bachelor" },
              { value: "master", label: "Master" },
              { value: "doctorate", label: "Doctorate" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="specializations"
          label="Specializations"
          rules={[{ required: true, message: "Please enter specializations" }]}
        >
          <Input.TextArea
            placeholder="Enter Specializations"
            className="w-full rounded-md"
            rows={4}
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="px-6 bg-button-primary hover:bg-button-primary"
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default DegreeAddModal;
