import React, { useEffect, useState } from "react";
import { Modal, Select, Form, Input, Button, App } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchHospitalListApi } from "../../../api/hospital.api";
import { createCollegeApi, updateCollegeApi } from "../../../api/college.api";
import {
  getStates,
  getDistricts,
} from "../../../api/location.api";
import { showError, showSuccess } from "../../Common/Notification";

/* ---------- TYPES ---------- */
export interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  name: string;
  state: string;
  district: string;
  city?: string;
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

/* -------------------- Component -------------------- */
const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const isEditMode = Boolean(initialData);

  /* -------------------- Location Logic -------------------- */
  const [states, setStates] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { label: string; value: string; key?: string }[]
  >([]);
  useEffect(() => {
    const initLocations = async () => {
      try {
        // Load all states (no country filter) so edit modal works for any country.
        const stateData = await getStates();
        setStates(
          stateData.map((s: any) => ({
            label: s.name,
            value: s.name,
            key: s.id,
          })),
        );
      } catch (error) {
        console.error("Failed to load locations", error);
      }
    };
    if (open) initLocations();
  }, [open]);

  const handleStateChange = async (_stateName: string, option: any) => {
    try {
      const stateId = option.key;
      if (!stateId) return;

      const districtData = await getDistricts(stateId);
      const mappedDistricts = districtData.map((d: any) => ({
        label: d.name,
        value: d.name,
        key: d.id,
      }));

      setDistricts(mappedDistricts);

      // reset dependent fields
      form.setFieldValue("district", undefined);
      form.setFieldValue("city", undefined);
    } catch (error) {
      console.error("Failed to load districts", error);
    }
  };

  /* -------------------- QUERY -------------------- */
  const { data: hospitalResponse, isFetching } = useQuery({
    queryKey: ["colleges-hospitals"],
    queryFn: fetchHospitalListApi,
  });

  const hospitals: Hospital[] = Array.isArray((hospitalResponse as any)?.data)
    ? (hospitalResponse as any).data
    : Array.isArray(hospitalResponse)
      ? hospitalResponse
      : [];

  const hospitalOptions = hospitals.map((h) => ({
    label: h.name,
    value: h.id,
  }));

  /* -------------------- Effects -------------------- */
  const primedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const primeEditForm = async () => {
      if (!initialData) return;
      if (primedIdRef.current === initialData.id) return; // avoid loops

      // Set hospital selections immediately
      form.setFieldsValue({
        ...initialData,
        hospitalIds: initialData.hospitals.map((h) => h.id) || [],
      });

      // Find matching state option (case-insensitive)
      const stateOpt = states.find(
        (s) =>
          s.value.toLowerCase() === (initialData.state || "").toLowerCase(),
      );

      if (stateOpt) {
        // Load districts for this state
        const districtData = await getDistricts(stateOpt.key);
        const mappedDistricts = districtData.map((d: any) => ({
          label: d.name,
          value: d.name,
          key: d.id,
        }));
        setDistricts(mappedDistricts);

        // Pick district option
        const districtOpt = mappedDistricts.find(
          (d: { value: string }) =>
            d.value.toLowerCase() ===
            (initialData.district || "").toLowerCase(),
        );

        // Finally set all location fields
        form.setFieldsValue({
          state: stateOpt.value,
          district: districtOpt?.value || initialData.district || "",
          city: initialData.city || "",
        });
      } else {
        // Fallback: just set existing strings; options will still render typed text
        form.setFieldsValue({
          state: initialData.state || "",
          district: initialData.district || "",
          city: initialData.city || "",
        });
      }

      primedIdRef.current = initialData.id;
    };

    if (open && initialData && states.length) {
      void primeEditForm();
    } else if (!initialData) {
      form.resetFields();
      primedIdRef.current = null;
    }
  }, [open, initialData, states, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: CollegeFormValues) =>
      createCollegeApi({
        ...values,
        city: values.city.toLowerCase(),
        district: values.district.toLowerCase(),
        state: values.state.toLowerCase(),
      }),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "College Created Successfully",
        description: data.message,
      });
      form.resetFields();
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
      console.log("Update Mutation: ", values);
      const payload: any = {
        ...values,
        city: values.city.toLowerCase(),
        district: values.district.toLowerCase(),
        state: values.state.toLowerCase(),
      };

      return updateCollegeApi(initialData!.id, payload);
    },
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "College Updated Successfully",
        description: data.message,
      });
      form.resetFields();
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
          label="State"
          name="state"
          rules={[{ required: true, message: "Please select state" }]}
        >
          <Select
            options={states}
            showSearch
            optionFilterProp="label"
            placeholder="Select state"
            onChange={(value, option) => handleStateChange(value, option)}
          />
        </Form.Item>

        <Form.Item
          label="District"
          name="district"
          rules={[{ required: true, message: "Please select district/city" }]}
        >
          <Select
            options={districts}
            showSearch
            optionFilterProp="label"
            placeholder="Select district"
          />
        </Form.Item>

        <Form.Item
          label="City / Town"
          name="city"
          rules={[{ required: true, message: "Please select city/town" }]}
        >
          <Select
            options={districts}
            showSearch
            optionFilterProp="label"
            placeholder="Select district"
          />
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
