import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  TimePicker,
  Upload,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

// First, let's add an interface for our form data
interface HospitalRegistrationData {
  name: string;
  branch_location: string;
  type: "hospital" | "clinic";
  city: string;
  state: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;
  website_url: string;
  logo_url: string;
  operating_hours: Array<{
    day: string;
    from: string;
    to: string;
  }>;
  hr_full_name: string;
  hr_email: string;
  hr_phone: string;
}

// Add interface for KYC data

const HospitalRegistration: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const [preRegistrationId, setPreRegistrationId] = useState<string>("");

  // Replace file states with URL states
  const [idProofUrl, setIdProofUrl] = useState<string>("");
  const [licenseUrl, setLicenseUrl] = useState<string>("");

  // Update the mutation with proper typing and error handling
  const hospitalRegistrationMutation = useMutation({
    mutationFn: (data: HospitalRegistrationData) =>
      axios.post("http://localhost:3000/api/hospital/hospital-register ", data),
    onSuccess: (response) => {
      // Store the pre-registration ID from the response
      const { id } = response.data;
      setPreRegistrationId(id);
      setCurrentStep(currentStep + 1);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      // Add error handling here
    },
  });

  // Update the KYC mutation to handle JSON
  const kycVerificationMutation = useMutation({
    mutationFn: (data: any) =>
      axios.post("http://localhost:3000/api/hospital/hospital-kyc", data, {
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: (response) => {
      console.log("KYC verification successful:", response.data);
      setCurrentStep(currentStep + 1);
      message.success("KYC submitted successfully");
    },
    onError: (error) => {
      console.error("KYC verification failed:", error);
      message.error("Failed to submit KYC");
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: (data: any) =>
      axios.post(
        `http://localhost:3000/api/student/register/set-password/${preRegistrationId}`,
        data
      ),
    onSuccess: () => {
      setIsModalOpen(false);
      // Add success notification or redirect here
    },
  });

  // Step 1: Basic Information
  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <div className="mb-4">
        <Upload
          className="flex justify-center"
          name="logo_url"
          onChange={({ file }) => {
            form.setFieldsValue({ logo_url: file.url || "" });
          }}
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <UploadOutlined className="text-2xl" />
            </div>
            <p>Profile Picture</p>
          </div>
        </Upload>
      </div>

      <Form.Item
        name="name"
        label={
          <span>
            Hospital/Clinic Name <span className="text-red-500">*</span>
          </span>
        }
        rules={[
          { required: true, message: "Please enter hospital/clinic name" },
        ]}
      >
        <Input placeholder="Enter Hospital/Clinic Name" />
      </Form.Item>

      <Form.Item
        name="type"
        label={
          <span>
            Type <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Please select type" }]}
      >
        <Select placeholder="Select Type">
          <Select.Option value="hospital">Hospital</Select.Option>
          <Select.Option value="clinic">Clinic</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="branch_location"
        label={
          <span>
            Branch Location <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Please enter branch location" }]}
      >
        <Input placeholder="Enter Location" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="city"
          label={
            <span>
              City/Town <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select city" }]}
        >
          <Select placeholder="Select City/Town">
            <Select.Option value="1">City 1</Select.Option>
            <Select.Option value="2">City 2</Select.Option>
            <Select.Option value="3">City 3</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="state"
          label={
            <span>
              State <span className="text-red-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select state" }]}
        >
          <Select placeholder="Select State">
            <option value="1">State 1</option>
            <option value="2">State 2</option>
            <option value="3">State 3</option>
          </Select>
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: "Please select country" }]}
        >
          <Select placeholder="Select Country">
            <Select.Option value="India">India</Select.Option>
            <Select.Option value="USA">USA</Select.Option>
            <Select.Option value="UK">UK</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="zipcode"
          label="Zip/Postal Code"
          rules={[{ required: true, message: "Please enter zip code" }]}
        >
          <Input placeholder="Ex 567899" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter valid email" },
          ]}
        >
          <Input placeholder="surya@xyz.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="+91 99999 99999" />
        </Form.Item>
      </div>

      <Form.List name="operating_hours">
        {(fields, { add }) => (
          <>
            <div className="flex justify-between items-center">
              <span>Operation Hrs</span>
              <Button
                type="link"
                onClick={() => add()}
                className="text-blue-500"
              >
                + Add
              </Button>
            </div>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="grid grid-cols-3 gap-4">
                <Form.Item
                  {...restField}
                  name={[name, "day"]}
                  rules={[{ required: true, message: "Please select days" }]}
                >
                  <Select placeholder="Select Days">
                    <Select.Option value="Monday to Friday">
                      Monday to Friday
                    </Select.Option>
                    <Select.Option value="Saturday">Saturday</Select.Option>
                    <Select.Option value="Sunday">Sunday</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "from"]}
                  rules={[{ required: true, message: "Please select time" }]}
                >
                  <TimePicker
                    placeholder="9:00 AM"
                    className="w-full"
                    format="HH:mm"
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "to"]}
                  rules={[{ required: true, message: "Please select time" }]}
                >
                  <TimePicker
                    placeholder="6:00 PM"
                    className="w-full"
                    format="HH:mm"
                  />
                </Form.Item>
              </div>
            ))}
          </>
        )}
      </Form.List>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span>Links</span>
          <Button type="link" className="text-blue-500">
            + Add
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="website_url"
            label="Website URL"
            rules={[{ required: true, message: "Please enter website URL" }]}
          >
            <Input placeholder="http://www.sample.com" />
          </Form.Item>
          <Form.Item>
            <Select placeholder="Website">
              <option value="1">Website 1</option>
              <option value="2">Website 2</option>
              <option value="3">Website 3</option>
            </Select>
          </Form.Item>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-4">HR/Admin Person Details</h3>
        <Form.Item
          name="hr_full_name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="Surya" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="hr_email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="surya@xyz.com" />
          </Form.Item>
          <Form.Item
            name="hr_phone"
            label="Phone Number"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="+91 99999 99999" />
          </Form.Item>
        </div>
      </div>

      <Form.Item name="logo_url" label="Logo">
        <Upload
          name="logo"
          onChange={({ file }) => {
            if (file.status === "done") {
              form.setFieldsValue({ logo_url: file.response.url });
            }
          }}
        >
          <Button icon={<UploadOutlined />}>Upload Logo</Button>
        </Upload>
      </Form.Item>
    </Form>
  );

  // Step 2: KYC Verification
  const renderStep2 = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        name="id_proof_type"
        label="ID Proof Type"
        rules={[{ required: true, message: "Please select ID proof type" }]}
      >
        <Select placeholder="Select ID Proof Type">
          <Select.Option value="Aadhaar Card">Aadhaar Card</Select.Option>
          <Select.Option value="PAN Card">PAN Card</Select.Option>
          <Select.Option value="Voter ID">Voter ID</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="id_proof_number"
        label="ID Proof Number"
        rules={[{ required: true, message: "Please enter ID proof number" }]}
      >
        <Input placeholder="Enter ID Proof Number" />
      </Form.Item>

      <Form.Item
        name="id_proof_url"
        label="Admin Person ID Proof"
        rules={[{ required: true, message: "Please upload ID proof" }]}
      >
        <Upload
          name="id_proof_url"
          beforeUpload={(file) => {
            setIdProofUrl(URL.createObjectURL(file));
            return false; // Prevent default upload behavior
          }}
          onRemove={() => {
            setIdProofUrl("");
            form.setFieldValue("id_proof_url", "");
          }}
        >
          <Button icon={<UploadOutlined />}>Upload ID Proof</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="license_type"
        label="License Type"
        rules={[{ required: true, message: "Please select license type" }]}
      >
        <Select placeholder="Select License Type">
          <Select.Option value="Hospital Registration Certificate">
            Hospital Registration Certificate
          </Select.Option>
          <Select.Option value="Clinic Registration Certificate">
            Clinic Registration Certificate
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="license_number"
        label="License Number"
        rules={[{ required: true, message: "Please enter license number" }]}
      >
        <Input placeholder="Enter License Number" />
      </Form.Item>

      <Form.Item
        name="license_url"
        label="Hospital/Clinic License"
        rules={[{ required: true, message: "Please upload license" }]}
      >
        <Upload
          name="license_url"
          beforeUpload={(file) => {
            setLicenseUrl(URL.createObjectURL(file));
            return false; // Prevent default upload behavior
          }}
          onRemove={() => {
            setLicenseUrl("");
            form.setFieldValue("license_url", "");
          }}
        >
          <Button icon={<UploadOutlined />}>Upload License</Button>
        </Upload>
      </Form.Item>
    </Form>
  );

  // Step 3: Password
  const renderStep3 = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        name="password"
        label="New Password"
        rules={[{ required: true, message: "Please enter new password" }]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("The passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm password" />
      </Form.Item>
    </Form>
  );

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      if (currentStep === 1) {
        const formattedValues: HospitalRegistrationData = {
          name: values.name,
          type: values.type,
          branch_location: values.branch_location,
          city: values.city,
          state: values.state,
          country: values.country,
          zipcode: values.zipcode,
          email: values.email,
          phone: values.phone,
          website_url: values.website_url,
          logo_url: values.logo_url ?? "",
          operating_hours:
            values.operating_hours?.map((hour: any) => ({
              day: hour.day,
              from: hour.from?.format("HH:mm"),
              to: hour.to?.format("HH:mm"),
            })) || [],
          hr_full_name: values.hr_full_name,
          hr_email: values.hr_email,
          hr_phone: values.hr_phone,
        };

        console.log("Formatted values:", formattedValues);
        hospitalRegistrationMutation.mutate(formattedValues);
      } else if (currentStep === 2) {
        // Now we can send just the URLs
        const kycData = {
          pre_registration_id: preRegistrationId,
          id_proof_type: values.id_proof_type,
          id_proof_number: values.id_proof_number,
          id_proof_url: idProofUrl, // Using the stored URL
          license_type: values.license_type,
          license_number: values.license_number,
          license_url: licenseUrl, // Using the stored URL
        };

        console.log("Sending KYC Data:", kycData);

        // Update mutation to send JSON instead of FormData
        kycVerificationMutation.mutate(kycData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const passwordData = {
        password: values.password,
        // pre_registration_id: preRegistrationId, // Make sure to include the ID
      };

      console.log("Step 3 payload:", passwordData);
      setPasswordMutation.mutate(passwordData);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const modalTitle =
    currentStep === 1
      ? "Hospital/Clinic Registration"
      : currentStep === 2
      ? "KYC Verification"
      : "Password";

  // Optional: Add a useEffect to prevent accessing step 2 without preRegistrationId
  useEffect(() => {
    if (currentStep === 2 && !preRegistrationId) {
      // Redirect back to step 1 or show error
      setCurrentStep(1);
      message.error("Please complete step 1 first");
    }
  }, [currentStep, preRegistrationId]);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Register Hospital/Clinic
      </Button>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          currentStep > 1 && (
            <Button
              key="back"
              onClick={handleBack}
              disabled={
                hospitalRegistrationMutation.isPending ||
                kycVerificationMutation.isPending
              }
            >
              Back
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="next"
            type="primary"
            className="bg-button-primary"
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            loading={
              hospitalRegistrationMutation.isPending ||
              kycVerificationMutation.isPending ||
              setPasswordMutation.isPending
            }
          >
            {currentStep === 3 ? "Submit" : "Next"}
          </Button>,
        ]}
        width={720}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Modal>
    </div>
  );
};

export default HospitalRegistration;
