import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  UploadProps,
  App,
} from "antd";
import { registerCollege, CollegeKycPayload } from "../../../api/college";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { UserOutlined } from "@ant-design/icons";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import { MobileIcon } from "../../Common/SVG/svg.functions";
import { showError, showSuccess } from "../../Common/Notification";
import PhoneNumberInput from "../../Common/PhoneNumberInput";

interface CollegeRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

export const uploadCollegeKyc = async (payload: CollegeKycPayload) => {
  const formData = new FormData();
  formData.append("college_id", payload.college_id);
  formData.append("user_id", payload.user_id);
  formData.append("id_proof_type", payload.id_proof_type);
  formData.append("id_proof_number", payload.id_proof_number);
  formData.append("license_type", payload.license_type);
  formData.append("license_number", payload.license_number);
  formData.append("id_proof", payload.id_proof);
  formData.append("license", payload.license);

  try {
    const response = await axios.post(
      `${API_URL}/api/college/clgid/kyc`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Failed to upload KYC");
    }
    throw error;
  }
};

const CollegeRegistration: React.FC<CollegeRegistrationProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentForm, setCurrentForm] = useState<"registration" | "kyc">(
    "registration"
  );
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [registrationData, setRegistrationData] = useState<{
    college_id: string;
    user_id: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { notification } = App.useApp();

  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        notification.error({
          message: "You can only upload image files!",
        });
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        notification.error({
          message: "Image must be smaller than 2MB!",
        });
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

        const response = await axios.post(
          `${API_URL}/api/post/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${TOKEN}`,
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.({ percent });
              }
            },
          }
        );

        const { url } = response.data;

        setImageUrl(url || "");
        form.setFieldsValue({ profile_image: url });

        onSuccess?.(response.data);
        showSuccess(notification, {
          message: "Image uploaded successfully!",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error("Upload error:", error);
        onError?.(error as Error);
        showError(notification, {
          message: "Failed to upload image!",
          description: "Failed to upload image",
        });
      } finally {
        setUploading(false);
      }
    },
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.collegeName,
        city: values.cityTown,
        district: values.district ?? "",
        affiliation: values.affiliationUniversity,
        state: values.state,
        country: values.country,
        email: values.email,
        phone: values.phone,
        website_url: values.website,
        hospitalIds: values.hospitalIds ?? [],
        admin_name: values.inChargeFullName,
        admin_email: values.inChargeEmail,
        admin_person_phone: values.inChargePhone,
        logoUrl: imageUrl,
      };

      const response = await registerCollege(payload);
      // Store the registration data
      setRegistrationData({
        college_id: response.college_id,
        user_id: response.user_id,
      });
      showSuccess(notification, {
        message: "College registered Successfully",
        description: response.message ?? "Operation completed successfully",
      });

      setCurrentForm("kyc");
    } catch (error) {
      console.error("Registration failed:", error);
      showError(notification, {
        message:
          error instanceof Error ? error.message : "Failed to register college",
        description: "Failed to register college",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (currentForm === "kyc" && registrationData) {
        // Get the file inputs
        const collegeKycInput = document.getElementById(
          "college-kyc-upload"
        ) as HTMLInputElement;
        const adminKycInput = document.getElementById(
          "admin-kyc-upload"
        ) as HTMLInputElement;

        if (!collegeKycInput?.files?.[0] || !adminKycInput?.files?.[0]) {
          showError(notification, {
            message: "Please upload both KYC documents",
            description: "Please upload both KYC documents",
          });
          return;
        }

        // Handle KYC submission
        const kycPayload = {
          college_id: registrationData.college_id,
          user_id: registrationData.user_id,
          id_proof_type: values.documentType,
          id_proof_number: values.documentNumber,
          license_type: values.adminDocumentType,
          license_number: values.adminDocumentNumber,
          id_proof: collegeKycInput.files[0],
          license: adminKycInput.files[0],
        };

        await uploadCollegeKyc(kycPayload);
        showSuccess(notification, {
          message: "KYC uploaded successfully",
          description: "KYC uploaded successfully",
        });
        handleCancel();
        queryClient.invalidateQueries({ queryKey: ["colleges"] });
      }
    } catch (error) {
      console.error("Submission failed:", error);
      showError(notification, {
        message: error instanceof Error ? error.message : "Failed to submit",
        description: "Operation failed",
      });
    }
  };

  const handleCancel = () => {
    setCurrentForm("registration");
    setRegistrationData(null);
    form.resetFields();
    setImageUrl("");
    onClose();
  };

  const KYCVerificationForm = () => {
    const [collegeKycFile, setCollegeKycFile] = useState<File | null>(null);
    const [adminKycFile, setAdminKycFile] = useState<File | null>(null);

    const handleCollegeKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setCollegeKycFile(e.target.files[0]);
      }
    };

    const handleAdminKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setAdminKycFile(e.target.files[0]);
      }
    };

    return (
      <div className="space-y-4">
        <h3 className="font-medium mb-4">College KYC Details</h3>
        <Form.Item name="documentType" label="Document Type">
          <Select placeholder="Select Document Type">
            <Select.Option value="aadhar">Aadhar Card</Select.Option>
            <Select.Option value="pan">PAN Card</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="documentNumber" label="Document Number">
          <Input placeholder="Enter Document Number" />
        </Form.Item>

        <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleCollegeKycUpload}
            className="hidden"
            id="college-kyc-upload"
          />
          <label htmlFor="college-kyc-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <span className="text-xl mb-2">↑</span>
              <p className="text-gray-600 font-medium">
                {collegeKycFile
                  ? collegeKycFile.name
                  : "Upload College KYC Doc"}
              </p>
              <p className="text-sm text-gray-400">Image size up to 2MB</p>
            </div>
          </label>
        </div>

        <h3 className="font-medium mb-4 mt-8">Admin KYC Details</h3>
        <Form.Item name="adminDocumentType" label="Document Type">
          <Select placeholder="Select Document Type">
            <Select.Option value="aadhar">Aadhar Card</Select.Option>
            <Select.Option value="pan">PAN Card</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="adminDocumentNumber" label="Document Number">
          <Input placeholder="Enter Document Number" />
        </Form.Item>

        <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleAdminKycUpload}
            className="hidden"
            id="admin-kyc-upload"
          />
          <label htmlFor="admin-kyc-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <span className="text-xl mb-2">↓</span>
              <p className="text-gray-600 font-medium">
                {adminKycFile ? adminKycFile.name : "Upload Admin KYC Doc"}
              </p>
              <p className="text-sm text-gray-400">Image size up to 2MB</p>
            </div>
          </label>
        </div>
      </div>
    );
  };

  const RegistrationForm = () => (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
          <Upload {...uploadProps}>
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserOutlined className="text-3xl text-gray-400" />
              )}
            </div>
          </Upload>
          {uploading && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Uploading...
            </div>
          )}
        </div>
      </div>

      <Form.Item
        name="collegeName"
        label="College Name *"
        rules={[
          { required: true, message: "Please enter college name" },
          // {
          //   pattern: /^[a-zA-Z\s]+$/,
          //   message: "Please enter a valid college name",
          // },
        ]}
      >
        <Select placeholder="Select College Name">
          <Select.Option value="college1">Vel Tech University</Select.Option>
          <Select.Option value="college2">Amrita University</Select.Option>
          <Select.Option value="college3">Anna University</Select.Option>
          <Select.Option value="college4">SRM University</Select.Option>
          <Select.Option value="college5">JNTU Hyderabad</Select.Option>
          <Select.Option value="college6">JNTU Kakatiya</Select.Option>
          <Select.Option value="college7">JNTU Anantapur</Select.Option>
          <Select.Option value="college8">JNTU Kurnool</Select.Option>
          <Select.Option value="college9">JNTU Khammam</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="affiliationUniversity"
        label="Affiliation University *"
        rules={[
          { required: true, message: "Please select affiliation university" },
        ]}
      >
        <Select placeholder="Select Affiliation University">
          <Select.Option value="university1">University 1</Select.Option>
          <Select.Option value="university2">University 2</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="cityTown" label="City/Town">
        <Input placeholder="Enter Location" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="state" label="State">
          <Select placeholder="Select State">
            <Select.Option value="state1">Tamil Nadu</Select.Option>
            <Select.Option value="state2">Karnataka</Select.Option>
            <Select.Option value="state3">Andhra Pradesh</Select.Option>
            <Select.Option value="state4">Telangana</Select.Option>
            <Select.Option value="state5">Kerala</Select.Option>
            <Select.Option value="state6">Maharashtra</Select.Option>
            <Select.Option value="state7">Rajasthan</Select.Option>
            <Select.Option value="state8">Gujarat</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="country" label="Country">
          <Select placeholder="Select Country">
            <Select.Option value="country1">India</Select.Option>
            <Select.Option value="country2">USA</Select.Option>
            <Select.Option value="country3">UK</Select.Option>
            <Select.Option value="country4">Australia</Select.Option>
            <Select.Option value="country5">Canada</Select.Option>
            <Select.Option value="country6">New Zealand</Select.Option>
            <Select.Option value="country7">South Africa</Select.Option>
            <Select.Option value="country8">Germany</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <Form.Item name="email" label="Email Address">
        <Input placeholder="surya@xyz.com" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        {/* <Form.Item
          name="phone"
          label="Phone Number *"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="+91 99999 99999" prefix={<MobileIcon />} />
        </Form.Item> */}
        <PhoneNumberInput name="phone" label="Phone Number" />

        <Form.Item name="website" label="Website *">
          <Input placeholder="http://www.sample.com" />
        </Form.Item>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-4">In- Charge Person Details</h3>
        <Form.Item name="inChargeFullName" label="Full Name">
          <Input placeholder="Surya" />
        </Form.Item>

        <Form.Item name="inChargeEmail" label="Email Address">
          <Input placeholder="surya@xyz.com" />
        </Form.Item>

        {/* <Form.Item name="inChargePhone" label="Phone Number">
          <Input placeholder="+91 99999 99999" prefix={<MobileIcon />} />
        </Form.Item> */}
        <PhoneNumberInput name="inChargePhone" label="Phone Number" />
      </div>
    </div>
  );

  const getModalTitle = () => {
    switch (currentForm) {
      case "registration":
        return "College Registration";
      case "kyc":
        return "KYC Verification";
      default:
        return "";
    }
  };

  const getCurrentForm = () => {
    switch (currentForm) {
      case "registration":
        return <RegistrationForm />;
      case "kyc":
        return <KYCVerificationForm />;
      default:
        return null;
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={isOpen}
      onCancel={handleCancel}
      width={800}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancel</Button>
          {currentForm === "kyc" ? (
            <Button
              type="primary"
              className="bg-button-primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          ) : (
            <Button
              type="primary"
              className="bg-button-primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </div>
      }
      className="max-w-4xl"
    >
      <div className="py-4">
        <Form form={form} layout="vertical" className="max-w-3xl mx-auto">
          {getCurrentForm()}
        </Form>
      </div>
    </Modal>
  );
};

export default CollegeRegistration;
