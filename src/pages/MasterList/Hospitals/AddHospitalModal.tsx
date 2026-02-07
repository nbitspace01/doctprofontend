import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { App, Button, Form, Input, Modal, Select, Switch } from "antd";

import {
  createHospitalApi,
  updateHospitalApi,
} from "../../../api/hospital.api";
import {
  getCountries,
  getStates,
  getDistricts,
} from "../../../api/location.api";
import { showError, showSuccess } from "../../Common/Notification";

/* -------------------- Types -------------------- */
interface HospitalData {
  id: string;
  name: string;
  logoUrl: string | null;
  branchLocation: string;
  city?: { id: string; name: string }; // Relation
  cityId?: string;
  stateId?: string;
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
  branchLocation?: string; // Legacy
  cityId: string;
}

/* -------------------- Component -------------------- */
const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const isEditMode = Boolean(initialData);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setdistricts] = useState<any[]>([]);

  // Helper state for filtering (not submitted)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

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
          ); // value is ID for fetching districts
        }
      } catch (error) {
        console.error("Failed to load locations", error);
      }
    };
    if (open) initLocations();
  }, [open]);

  // Handler for State Change (Filter)
  const handleStateChange = async (stateId: string) => {
    try {
      setSelectedStateId(stateId);
      form.setFieldValue("cityId", undefined); // Reset city
      const cityData = await getDistricts(stateId); // fetch by state
      setdistricts(cityData.map((c: any) => ({ label: c.name, value: c.id })));
    } catch (error) {
      console.error("Failed to load districts", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        isHeadBranch: false,
        cityId: initialData.cityId,
      });

      if (initialData.stateId) {
        setSelectedStateId(initialData.stateId);
        // Fetch districts for the existing state so the city dropdown works
        getDistricts(initialData.stateId)
          .then((cityData) => {
            setdistricts(
              cityData.map((c: any) => ({ label: c.name, value: c.id })),
            );
          })
          .catch((err) => console.error(err));
      }
    } else {
      form.resetFields();
      setSelectedStateId(null);
      setdistricts([]);
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: HospitalFormValues) =>
      createHospitalApi({
        ...values,
        // branchLocation: values.branchLocation?.toLowerCase(), // Deprecated
      }),
    // ... same success/error handlers
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
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create hospital";
      const firstDetail = error?.response?.data?.errors?.[0]?.message;
      showError(notification, {
        message: "Failed to create hospital",
        description: firstDetail || apiMessage,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: HospitalFormValues) => {
      // Logic for update
      return updateHospitalApi(initialData!.id, values);
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
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update hospital";
      const firstDetail = error?.response?.data?.errors?.[0]?.message;
      showError(notification, {
        message: "Failed to update hospital",
        description: firstDetail || apiMessage,
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
          {/* Hospital Name */}
          <Form.Item
            
            name="name"
            label="Hospital Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter Hospital Name" />
          </Form.Item>

          {/* Branch Location */}
          {/* Branch Location (State Filter + City Selection) */}
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
            label="Branch Location (City)"
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
