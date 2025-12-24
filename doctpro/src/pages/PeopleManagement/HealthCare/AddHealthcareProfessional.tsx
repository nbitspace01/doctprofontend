import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UploadProps } from "antd";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Upload,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import { showError, showSuccess } from "../../Common/Notification";
import { MobileIcon } from "../../Common/SVG/svg.functions";
import dayjs from "dayjs";

interface AddHealthcareProfessionalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const AddHealthcareProfessional: React.FC<AddHealthcareProfessionalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const { data: collegesData } = useQuery({
    queryKey: ["colleges"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/college/list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      return response.data?.data || [];
    },
  });

  const { data: degreesData } = useQuery({
    queryKey: ["degrees"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/degree/list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      return response.data?.data || [];
    },
  });

  const { data: hospitalsData } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/hospital?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      return response.data?.data || [];
    },
  });

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

        const response = await axios.post(`${API_URL}/api/post/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${TOKEN}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              onProgress?.({ percent: Math.round((progressEvent.loaded * 100) / progressEvent.total) });
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

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setImageUrl("");
      setCurrentStep(1);
    }
  }, [open, form]);

  const createHealthcareProfessionalMutation = useMutation({
    mutationFn: (values: any) => {
      const payload = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : undefined,
        gender: values.gender,
        location: values.cityTown,
        state: values.state,
        country: values.country,
        collegeName: values.collegeName,
        degree: values.degree,
        specialization: values.specialization,
        startYear: values.startYear ? dayjs(values.startYear).format("YYYY") : undefined,
        endYear: values.endYear ? dayjs(values.endYear).format("YYYY") : undefined,
        hospitalName: values.hospitalName,
        role: values.role,
        startFrom: values.startFrom ? dayjs(values.startFrom).format("YYYY-MM") : undefined,
        endTo: values.endTo ? dayjs(values.endTo).format("YYYY-MM") : undefined,
        currentlyWorking: values.currentlyWorking || false,
        profile_image: imageUrl || "",
      };
      return axios.post(`${API_URL}/api/healthCare/healthcare-professionals`, payload, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    },
    onSuccess: () => {
      showSuccess(notification, { message: "Healthcare Professional Created Successfully" });
      form.resetFields();
      setImageUrl("");
      setCurrentStep(1);
      queryClient.invalidateQueries({ queryKey: ["healthcareProfessionals"] });
      onCancel();
      onSuccess?.();
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to create healthcare professional",
        description: error.response?.data?.error ?? "Failed to create healthcare professional",
      });
    },
  });

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep === 1) setCurrentStep(2);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createHealthcareProfessionalMutation.mutate(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <div className="flex flex-col items-center mb-6">
        <Upload {...uploadProps}>
          <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
            {imageUrl ? (
              <Image src={imageUrl} preview={false} alt="Profile" className="w-full h-full object-cover" onError={() => setImageUrl("")} />
            ) : (
              <UserOutlined className="text-3xl text-gray-400" />
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <CameraOutlined className="text-white text-sm" />
            </div>
          </div>
        </Upload>
        <p className="text-gray-500 text-sm mt-2">Profile Picture</p>
        {uploading && <div className="text-center text-sm text-gray-500 mt-2">Uploading...</div>}
      </div>
      <Form.Item name="profile_image" hidden>
        <Input />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please enter first name" }]}>
          <Input placeholder="Enter First Name" />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please enter last name" }]}>
          <Input placeholder="Enter Last Name" />
        </Form.Item>
      </div>
      <Form.Item label="Email Address" name="email">
        <Input placeholder="Enter Email Address" />
      </Form.Item>
      <Form.Item
        label="Phone Number"
        name="phone"
        rules={[
          { required: true, message: "Please enter phone number" },
          { pattern: /^[0-9]{10}$/, message: "Phone number must be 10 digits" },
        ]}
      >
        <Input type="tel" placeholder="Enter Phone Number" prefix={<MobileIcon />} maxLength={10} />
      </Form.Item>
      <Form.Item label="DOB" name="dob">
        <DatePicker placeholder="MM/DD/YYYY" format="MM/DD/YYYY" className="w-full" />
      </Form.Item>
      <Form.Item label="Gender" name="gender">
        <Select placeholder="Select Gender">
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="City/Town" name="cityTown">
        <Input placeholder="Enter Location" />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="State" name="state">
          <Select placeholder="Select State">
            <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
            <Select.Option value="Karnataka">Karnataka</Select.Option>
            <Select.Option value="Maharashtra">Maharashtra</Select.Option>
            <Select.Option value="Delhi">Delhi</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Country" name="country">
          <Select placeholder="Select Country">
            <Select.Option value="India">India</Select.Option>
            <Select.Option value="USA">USA</Select.Option>
          </Select>
        </Form.Item>
      </div>
    </Form>
  );

  const renderStep2 = () => (
    <Form form={form} layout="vertical">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Degree specialisation</h3>
        <Form.Item label="College Name" name="collegeName" rules={[{ required: true, message: "Please select college name" }]}>
          <Select placeholder="Select College Name" showSearch>
            {collegesData?.map((college: any) => (
              <Select.Option key={college.id} value={college.name}>
                {college.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Degree" name="degree" rules={[{ required: true, message: "Please select degree" }]}>
          <Select placeholder="Select Degree" showSearch>
            {degreesData?.map((degree: any) => (
              <Select.Option key={degree.id} value={degree.name}>
                {degree.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Specialisations" name="specialization" rules={[{ required: true, message: "Please select specialisation" }]}>
          <Select placeholder="Select Specialisations" showSearch>
            {degreesData?.flatMap((degree: any) => degree.specialization || []).map((spec: string, index: number) => (
              <Select.Option key={index} value={spec}>
                {spec}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Start Year" name="startYear">
            <DatePicker picker="month" placeholder="Select Year" format="MMM YYYY" className="w-full" />
          </Form.Item>
          <Form.Item label="End Year" name="endYear" rules={[{ required: true, message: "Please select end year" }]}>
            <DatePicker picker="month" placeholder="Select Year" format="MMM YYYY" className="w-full" />
          </Form.Item>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Experience Details</h3>
        <Form.Item label="hospital/college Name" name="hospitalName" rules={[{ required: true, message: "Please select hospital/college name" }]}>
          <Select placeholder="Select hospital/college" showSearch>
            {hospitalsData?.map((hospital: any) => (
              <Select.Option key={hospital.id} value={hospital.name}>
                {hospital.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Role" name="role" rules={[{ required: true, message: "Please select role" }]}>
          <Select placeholder="Select Role">
            <Select.Option value="doctor">Doctor</Select.Option>
            <Select.Option value="nurse">Nurse</Select.Option>
            <Select.Option value="surgeon">Surgeon</Select.Option>
          </Select>
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Start From" name="startFrom" rules={[{ required: true, message: "Please select start date" }]}>
            <DatePicker picker="month" placeholder="Mon/Year" format="MMM/YYYY" className="w-full" />
          </Form.Item>
          <Form.Item label="End to" name="endTo" rules={[{ required: true, message: "Please select end date" }]}>
            <DatePicker picker="month" placeholder="Mon/Year" format="MMM/YYYY" className="w-full" />
          </Form.Item>
        </div>
        <Form.Item name="currentlyWorking" valuePropName="checked" className="mb-0">
          <Checkbox>You're Currently Working</Checkbox>
        </Form.Item>
      </div>
    </Form>
  );

  return (
    <Modal
      title={
        <span>
          Add New <span className="text-black">Healthcare Professionals</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <div className="flex justify-between items-center">
          <div>{currentStep > 1 && <Button onClick={handleBack} className="border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700">Back</Button>}</div>
          <div className="flex gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              className="bg-button-primary hover:!bg-button-primary"
              onClick={currentStep === 2 ? handleSubmit : handleNext}
              loading={createHealthcareProfessionalMutation.isPending || uploading}
            >
              {currentStep === 2 ? "Submit" : "Continue"}
            </Button>
          </div>
        </div>
      }
      width={600}
      className="rounded-lg"
    >
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </Modal>
  );
};

export default AddHealthcareProfessional;
