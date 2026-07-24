import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { App, Button, Form, Input, Modal, Select } from "antd";

import { createClinicApi, updateClinicApi } from "../../../api/clinic.api";
import {
  getCountries,
  getStates,
  getDistricts,
} from "../../../api/location.api";
import { showError, showSuccess } from "../../Common/Notification";

/* -------------------- Types -------------------- */
export interface ClinicData {
  id: string;
  name: string;
  logoUrl: string | null;
  branchLocation: string;
  cityId?: string | null;
  districtId?: string | null;
  stateId?: string | null;
  stateName?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AddClinicModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: ClinicData | null;
}

interface ClinicFormValues {
  name: string;
  cityId: string;
}

/* -------------------- Component -------------------- */
const AddClinicModal: React.FC<AddClinicModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const isEditMode = Boolean(initialData);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const resolveStateIdFromName = (stateValue?: string | null) => {
    if (!stateValue) return null;
    const normalized = stateValue.toLowerCase();
    const match = states.find(
      (s) => String(s.label || "").toLowerCase() === normalized,
    );
    return match?.value ?? null;
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    const initLocations = async () => {
      try {
        const countries = await getCountries();
        const india = countries.find(
          (c: any) => c.code === "IN" || c.name === "India",
        );
        if (india) {
          const stateData = await getStates(india.id);
          setStates(
            stateData.map((s: any) => ({ label: s.name, value: s.id })),
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
      setSelectedStateId(stateId);
      form.setFieldValue("cityId", undefined);
      const cityData = await getDistricts(stateId);
      setDistricts(cityData.map((c: any) => ({ label: c.name, value: c.id })));
    } catch (error) {
      console.error("Failed to load districts", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const resolvedStateId =
        initialData.stateId || resolveStateIdFromName(initialData.stateName);
      const resolvedCityId = initialData.cityId || initialData.districtId;

      form.setFieldsValue({
        name: initialData.name,
        cityId: resolvedCityId,
      });

      if (resolvedStateId) {
        setSelectedStateId(resolvedStateId);
        getDistricts(resolvedStateId)
          .then((cityData) => {
            const options = cityData.map((c: any) => ({
              label: c.name,
              value: c.id,
            }));
            setDistricts(options);
            if (resolvedCityId) {
              form.setFieldValue("cityId", resolvedCityId);
            }
          })
          .catch((err) => console.error(err));
      } else {
        setDistricts([]);
      }
    } else {
      form.resetFields();
      setSelectedStateId(null);
      setDistricts([]);
    }
  }, [open, initialData, form, states]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: ClinicFormValues) => createClinicApi(values),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Clinic Created Successfully",
        description: data.message,
      });
      form.resetFields();
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create clinic";
      const firstDetail = error?.response?.data?.errors?.[0]?.message;
      showError(notification, {
        message: "Failed to create clinic",
        description: firstDetail || apiMessage,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClinicFormValues) =>
      updateClinicApi(initialData!.id, values),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Clinic Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update clinic";
      const firstDetail = error?.response?.data?.errors?.[0]?.message;
      showError(notification, {
        message: "Failed to update clinic",
        description: firstDetail || apiMessage,
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = (values: ClinicFormValues) => {
    isEditMode ? updateMutation.mutate(values) : createMutation.mutate(values);
  };

  return (
    <Modal
      title={isEditMode ? "Edit Clinic" : "Create New Clinic"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} onFinish={handleSubmit}>
        <div className="space-y-6 py-4">
          <Form.Item
            name="name"
            label="Clinic Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter Clinic Name" />
          </Form.Item>

          <Form.Item label="Filter by State" style={{ marginBottom: 12 }}>
            <Select
              placeholder="Select State first"
              options={states}
              value={selectedStateId}
              onChange={handleStateChange}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="cityId"
            label="Location (City)"
            rules={[{ required: true, message: "Please select city" }]}
          >
            <Select
              placeholder="Select City"
              options={districts}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
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
        </div>
      </Form>
    </Modal>
  );
};

export default AddClinicModal;
