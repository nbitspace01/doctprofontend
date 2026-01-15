import { Modal, Select, Form, Input, Button, notification } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { apiClient } from "../../../api/api";
import { fetchHospitalListApi } from "../../../api/hospital.api";
import create from "@ant-design/icons/lib/components/IconFont";
import { createCollegeApi } from "../../../api/college.api";

interface AddCollegeModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CollegePayload {
  name: string;
  city: string;
  district: string;
  state: string;
  associatedHospital: string;
  hospitalIds: string[];
}

const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const associatedHospital = useQuery({
    queryKey: ["associatedHospital"],
    // queryFn: () => axios.get(`${API_URL}/api/hospital/hospitalNameList`),
    queryFn: fetchHospitalListApi,
  });

  // Move the mutation hook here
  const addCollegeMutation = useMutation({
    mutationFn: async (data: CollegePayload) => {
      // const response = await axios.post(`${API_URL}/api/college/`, data);
      // return response.data;
      return createCollegeApi(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      notification.success({
        message: "College Added Successfully",
        description: data.message,
      });
      form.resetFields();
      onClose();
    },
  });

  // Early return if the modal is not visible
  if (!visible) return null;

  const handleSubmit = async (values: CollegePayload) => {
    console.log("Submitting college with values:", values);
    try {
      await addCollegeMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error adding college:", error);
    }
  };

  return (
    <Modal
      title="Add New College"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="College Name"
          name="name"
          rules={[
            { required: true, message: "Please enter college name" },
            {
              pattern: /^[a-zA-Z\s]+$/,
              message: "Please enter a valid college name",
            },
          ]}
        >
          <Input placeholder="Enter College Name" className="w-full" />
        </Form.Item>

        <Form.Item
          label="City/Town"
          name="city"
          rules={[{ required: true, message: "Please enter city" }]}
        >
          <Input placeholder="Enter Location" className="w-full" />
        </Form.Item>

        <Form.Item
          label="District"
          name="district"
          rules={[{ required: true, message: "Please select district" }]}
        >
          <Select placeholder="Select District">
            <Select.Option value="Chennai">Chennai</Select.Option>
            <Select.Option value="Coimbatore">Coimbatore</Select.Option>
            <Select.Option value="Madurai">Madurai</Select.Option>
            <Select.Option value="Salem">Salem</Select.Option>
            <Select.Option value="Erode">Erode</Select.Option>
            <Select.Option value="Thanjavur">Thanjavur</Select.Option>
            <Select.Option value="Tiruchirappalli">
              Tiruchirappalli
            </Select.Option>

            {/* Add more districts as needed */}
          </Select>
        </Form.Item>

        <Form.Item
          label="State"
          name="state"
          rules={[{ required: true, message: "Please select state" }]}
        >
          <Select 
            placeholder="Select State"
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? "").toString().toLowerCase().includes(input.toLowerCase())
            }
          >
            <Select.Option value="Andhra Pradesh">Andhra Pradesh</Select.Option>
            <Select.Option value="Arunachal Pradesh">Arunachal Pradesh</Select.Option>
            <Select.Option value="Assam">Assam</Select.Option>
            <Select.Option value="Bihar">Bihar</Select.Option>
            <Select.Option value="Chhattisgarh">Chhattisgarh</Select.Option>
            <Select.Option value="Goa">Goa</Select.Option>
            <Select.Option value="Gujarat">Gujarat</Select.Option>
            <Select.Option value="Haryana">Haryana</Select.Option>
            <Select.Option value="Himachal Pradesh">Himachal Pradesh</Select.Option>
            <Select.Option value="Jharkhand">Jharkhand</Select.Option>
            <Select.Option value="Karnataka">Karnataka</Select.Option>
            <Select.Option value="Kerala">Kerala</Select.Option>
            <Select.Option value="Madhya Pradesh">Madhya Pradesh</Select.Option>
            <Select.Option value="Maharashtra">Maharashtra</Select.Option>
            <Select.Option value="Manipur">Manipur</Select.Option>
            <Select.Option value="Meghalaya">Meghalaya</Select.Option>
            <Select.Option value="Mizoram">Mizoram</Select.Option>
            <Select.Option value="Nagaland">Nagaland</Select.Option>
            <Select.Option value="Odisha">Odisha</Select.Option>
            <Select.Option value="Punjab">Punjab</Select.Option>
            <Select.Option value="Rajasthan">Rajasthan</Select.Option>
            <Select.Option value="Sikkim">Sikkim</Select.Option>
            <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
            <Select.Option value="Telangana">Telangana</Select.Option>
            <Select.Option value="Tripura">Tripura</Select.Option>
            <Select.Option value="Uttar Pradesh">Uttar Pradesh</Select.Option>
            <Select.Option value="Uttarakhand">Uttarakhand</Select.Option>
            <Select.Option value="West Bengal">West Bengal</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Associated Hospital"
          name="hospitalIds"
          rules={[
            { required: true, message: "Please select associated hospital" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select Associated Hospital"
            className="w-full"
          >
            {associatedHospital.data?.map((hospital: any) => (
              <Select.Option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </Select.Option>
            ))}

            {/* Add more hospitals as needed */}
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={addCollegeMutation.isPending}
            className="bg-button-primary hover:!bg-button-primary"
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCollegeModal;
