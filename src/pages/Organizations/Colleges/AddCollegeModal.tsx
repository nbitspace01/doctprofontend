import React, { useEffect } from "react";
import { Modal, Select, Form, Input, Button, notification, Spin } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHospitalListApi } from "../../../api/hospital.api";
import { createCollegeApi, updateCollegeApi } from "../../../api/college.api";
import { CollegeData } from "./CollegeList";

interface AddCollegeModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: CollegeData | null;
}

interface CollegePayload {
  name: string;
  city: string;
  district: string;
  state: string;
  hospitalIds: string[];
}

export const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const DISTRICT_OPTIONS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Salem",
  "Erode",
  "Thanjavur",
  "Tiruchirappalli",
  "Bangalore",
  "Mysore",
  "Mangalore",
  "Hyderabad",
  "Warangal",
  "Secunderabad",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Jaipur",
  "Jodhpur",
  "Udaipur",
  "Lucknow",
  "Kanpur",
  "Varanasi",
  "Patna",
  "Gaya",
  "Ranchi",
  "Jamshedpur",
  "Bhopal",
  "Indore",
  "Gwalior",
  "Thiruvananthapuram",
  "Kochi",
  "Kozhikode",
  "Shillong",
  "Gangtok",
  "Imphal",
  "Agartala",
];

const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["hospitalList"],
    queryFn: fetchHospitalListApi,
  });

  const collegeMutation = useMutation({
    mutationFn: (payload: CollegePayload) =>
      initialData
        ? updateCollegeApi(initialData.id, payload)
        : createCollegeApi(payload),
    onSuccess: (data) => {
      notification.success({
        message: initialData ? "College Updated" : "College Added",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      form.resetFields();
      onClose();
    },
    onError: (error: any) => {
      notification.error({
        message: "Operation Failed",
        description: error?.response?.data?.message || "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        name: initialData.collegeName,
        city: initialData.city,
        district: initialData.district,
        state: initialData.state,
        hospitalIds: initialData.hospitals?.map((h) => h.id) || [],
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleSubmit = (values: any) => {
    const payload: CollegePayload = {
      name: values.name,
      city: values.city,
      district: values.district,
      state: values.state,
      hospitalIds: values.hospitalIds,
    };
    collegeMutation.mutate(payload);
  };

  if (!open) return null;

  return (
    <Modal
      title={initialData ? "Edit College" : "Add New College"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="College Name"
            name="name"
            rules={[{ required: true, message: "Please enter college name" }]}
          >
            <Input placeholder="Enter college name" />
          </Form.Item>

          <Form.Item
            label="City / Town"
            name="city"
            rules={[{ required: true, message: "Please enter city" }]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>

          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: "Please select district" }]}
          >
            <Select placeholder="Select district">
              {DISTRICT_OPTIONS.map((d) => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: "Please select state" }]}
          >
            <Select showSearch placeholder="Select state">
              {STATE_OPTIONS.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Associated Hospital"
            name="hospitalIds"
            rules={[{ required: true, message: "Please select hospital" }]}
          >
            <Select mode="multiple" placeholder="Select hospitals">
              {hospitals.map((h: any) => (
                <Select.Option key={h.id} value={h.id}>
                  {h.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={collegeMutation.isPending}
              className="bg-button-primary"
            >
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default AddCollegeModal;
