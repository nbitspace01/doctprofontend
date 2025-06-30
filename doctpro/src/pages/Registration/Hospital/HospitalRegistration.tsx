import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  TimePicker,
  Upload,
  UploadProps,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { TOKEN, USER_ID } from "../../Common/constant.function";
import { showError, showSuccess } from "../../Common/Notification";
import { MobileIcon } from "../../Common/SVG/svg.functions";
import PhoneNumberInput from "../../Common/PhoneNumberInput";

// First, let's add an interface for our form data
interface HospitalRegistrationData {
  name: string;
  branchLocation: string;
  type: "hospital" | "clinic";
  city: string;
  state: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  operating_hours: Array<{
    day: string;
    from: string;
    to: string;
  }>;
  links: Array<{
    type: string;
    url: string;
  }>;
  contact_person: string;
  admin_email: string;
  admin_phone: string;
}

// interface UpdateHospitalData {
//   hospital_id: string;
//   logoUrl: string;
// }

// Add interface for KYC data

interface HospitalRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const HospitalRegistration: React.FC<HospitalRegistrationProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const [preRegistrationId, setPreRegistrationId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { notification } = App.useApp();
  // State for KYC file objects
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  // Update the mutation with proper typing and error handling
  const hospitalRegistrationMutation = useMutation({
    mutationFn: (data: HospitalRegistrationData) =>
      axios.post(`${API_URL}/api/hospital/register`, data),
    onSuccess: (response) => {
      // Store the pre-registration ID from the response
      const { hospital_id, user_id } = response.data;
      setPreRegistrationId(hospital_id);
      setUserId(user_id);
      setCurrentStep(currentStep + 1);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      // Add error handling here
    },
  });

  // const updateHospitalMutation = useMutation({
  //   mutationFn: (data: UpdateHospitalData) =>
  //     axios.put(`${API_URL}/api/hospital/register/${data.hospital_id}`, {
  //       logoUrl: data.logoUrl,
  //     }),
  //   onSuccess: () => {
  //     // Optionally handle success, e.g., show a notification
  //   },
  //   onError: (error) => {
  //     console.error("Updating hospital with logo failed:", error);
  //     showError(notification, {
  //       message: "Failed to save logo.",
  //       description: "Failed to save logo.",
  //     });
  //   },
  // });

  const kycVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();

      formData.append("user_id", data.user_id);
      formData.append("hospital_id", data.hospital_id);
      formData.append("id_proof_type", data.id_proof_type);
      formData.append("id_proof_number", data.id_proof_number);
      formData.append("license_type", data.license_type);
      formData.append("license_number", data.license_number);

      if (data.id_proof_file) {
        formData.append("id_proof", data.id_proof_file);
      }
      if (data.license_file) {
        formData.append("license", data.license_file);
      }

      return axios.post(`${API_URL}/api/hospital/upload`, formData, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      console.log("KYC verification successful:", response.data);
      setCurrentStep(currentStep + 1);
      showSuccess(notification, {
        message: "KYC submitted successfully",
        description:
          response.data.message ?? "Operation completed successfully",
      });
    },
    onError: (error: any) => {
      console.error("KYC verification failed:", error);
      showError(notification, {
        message: "Failed to submit KYC",
        description:
          error.response?.data?.message ?? error.message ?? "Operation failed",
      });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: (data: any) =>
      axios.post(`${API_URL}/api/user/register/set-password/${userId}`, data),
    onSuccess: () => {
      onClose();
      // Add success notification or redirect here
    },
  });

  const uploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        showError(notification, {
          message: "You can only upload image files!",
          description: "You can only upload image files!",
        });
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        showError(notification, {
          message: "Image must be smaller than 2MB!",
          description: "Image must be smaller than 2MB!",
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
        form.setFieldsValue({ logoUrl: url });

        onSuccess?.(response.data);
        showSuccess(notification, {
          message: "Image uploaded successfully!",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error("Upload error:", error);
        onError?.(error as Error);
        showError(notification, {
          message: "Failed to upload image",
          description: "Failed to upload image",
        });
      } finally {
        setUploading(false);
      }
    },
  };

  const idProofUploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: ".pdf,.jpg,.jpeg,.png",
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const fileObj = file as File;
        setIdProofFile(fileObj);
        form.setFieldsValue({ id_proof_url: fileObj.name });
        onSuccess?.(file);
      } catch (err: any) {
        onError?.(err);
      }
    },
  };

  const licenseUploadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    accept: ".pdf,.jpg,.jpeg,.png",
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const fileObj = file as File;
        setLicenseFile(fileObj);
        form.setFieldsValue({ license_url: fileObj.name });
        onSuccess?.(file);
      } catch (err: any) {
        onError?.(err);
      }
    },
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <div className="flex justify-center mb-6">
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
        name="branchLocation"
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
            <Select.Option value="Mumbai">Mumbai</Select.Option>
            <Select.Option value="Delhi">Delhi</Select.Option>
            <Select.Option value="Bangalore">Bangalore</Select.Option>
            <Select.Option value="Chennai">Chennai</Select.Option>
            <Select.Option value="Kolkata">Kolkata</Select.Option>
            <Select.Option value="Hyderabad">Hyderabad</Select.Option>
            <Select.Option value="Pune">Pune</Select.Option>
            <Select.Option value="Jaipur">Jaipur</Select.Option>
            <Select.Option value="Ahmedabad">Ahmedabad</Select.Option>
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
            <Select.Option value="Maharashtra">Maharashtra</Select.Option>
            <Select.Option value="Delhi">Delhi</Select.Option>
            <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
            <Select.Option value="Karnataka">Karnataka</Select.Option>
            <Select.Option value="Andhra Pradesh">Andhra Pradesh</Select.Option>
            <Select.Option value="Telangana">Telangana</Select.Option>
            <Select.Option value="Kerala">Kerala</Select.Option>
            <Select.Option value="Rajasthan">Rajasthan</Select.Option>
            <Select.Option value="Gujarat">Gujarat</Select.Option>
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
            <Select.Option value="Australia">Australia</Select.Option>
            <Select.Option value="Canada">Canada</Select.Option>
            <Select.Option value="New Zealand">New Zealand</Select.Option>
            <Select.Option value="South Africa">South Africa</Select.Option>
            <Select.Option value="Sri Lanka">Sri Lanka</Select.Option>
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

        {/* <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="+91 99999 99999" prefix={<MobileIcon />} />
        </Form.Item> */}
        <PhoneNumberInput name="phone" label="Phone Number" />
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
            name="website"
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
          {/* <Form.Item
            name="hr_phone"
            label="Phone Number"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="+91 99999 99999" />
          </Form.Item> */}
          <PhoneNumberInput name="hr_phone" label="Phone Number" />
        </div>
      </div>

      {/* This hidden field will hold the uploaded logo URL */}
      <Form.Item name="logoUrl" hidden>
        <Input />
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
        label={
          <div className="flex items-center gap-2">
            <span>Admin Person ID Proof</span>
            <span className="text-gray-500 text-sm">
              📁 Upload file (PDF/JPG)
            </span>
          </div>
        }
        rules={[{ required: true, message: "Please upload ID proof" }]}
      >
        <Upload {...idProofUploadProps}>
          <Button icon={<UploadOutlined />} className="w-full">
            <div className="flex items-center justify-between w-full">
              <span>Choose File</span>
              {idProofFile && (
                <span className="text-gray-500">📁 {idProofFile.name}</span>
              )}
            </div>
          </Button>
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
        label={
          <div className="flex items-center gap-2">
            <span>Hospital/Clinic License</span>
            <span className="text-gray-500 text-sm">
              📁 Upload file (PDF/JPG)
            </span>
          </div>
        }
        rules={[{ required: true, message: "Please upload license" }]}
      >
        <Upload {...licenseUploadProps}>
          <Button icon={<UploadOutlined />} className="w-full">
            <div className="flex items-center justify-between w-full">
              <span>Choose File</span>
              {licenseFile && (
                <span className="text-gray-500">📁 {licenseFile.name}</span>
              )}
            </div>
          </Button>
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
          branchLocation: values.branchLocation,
          city: values.city,
          state: values.state,
          country: values.country,
          zipcode: values.zipcode,
          email: values.email,
          phone: values.phone,
          website: values.website,
          logoUrl: imageUrl, // Use the URL from the state
          operating_hours:
            values.operating_hours?.map((hour: any) => ({
              day: hour.day,
              from: hour.from?.format("HH:mm"),
              to: hour.to?.format("HH:mm"),
            })) ?? [],
          links: [
            {
              type: "Website",
              url: values.website,
            },
          ],
          contact_person: values.hr_full_name,
          admin_email: values.hr_email,
          admin_phone: values.hr_phone,
        };

        console.log("Formatted values:", formattedValues);
        hospitalRegistrationMutation.mutate(formattedValues, {
          onSuccess: (response) => {
            const { hospital_id, user_id } = response.data;
            setPreRegistrationId(hospital_id);
            setUserId(user_id);
            setCurrentStep(currentStep + 1);
            showSuccess(notification, {
              message: "Registration Successful",
              description: "Proceeding to KYC verification.",
            });
          },
          onError: (error: any) => {
            showError(notification, {
              message: "Registration Failed",
              description:
                error.response?.data?.message ?? "An unknown error occurred.",
            });
          },
        });
      } else if (currentStep === 2) {
        if (!userId || !preRegistrationId) {
          showError(notification, {
            message:
              "Missing required registration data. Please complete step 1 first.",
          });
          return;
        }
        if (!values.id_proof_type || !values.id_proof_number || !idProofFile) {
          showError(notification, {
            message: "Please fill in all ID proof details",
          });
          return;
        }

        if (!values.license_type || !values.license_number || !licenseFile) {
          showError(notification, {
            message: "Please fill in all license details",
          });
          return;
        }
        const kycData = {
          user_id: userId,
          hospital_id: preRegistrationId,
          id_proof_type: values.id_proof_type,
          id_proof_number: values.id_proof_number,
          id_proof_file: idProofFile,
          license_type: values.license_type,
          license_number: values.license_number,
          license_file: licenseFile,
        };

        console.log("Submitting KYC Data:", kycData);
        kycVerificationMutation.mutate(kycData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      showError(notification, {
        message: "Please fill in all required fields",
      });
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
      };

      console.log("Step 3 payload:", passwordData);
      setPasswordMutation.mutate(passwordData);
      showSuccess(notification, {
        message: "Password set successfully",
        description: "Password set successfully",
      });
    } catch (error) {
      console.error("Validation failed:", error);
      showError(notification, {
        message: "Validation failed",
        description: "Validation failed",
      });
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
      showError(notification, {
        message: "Please complete step 1 first",
        description: "Please complete step 1 first",
      });
    }
  }, [currentStep, preRegistrationId]);

  // Add debugging for userId and preRegistrationId
  useEffect(() => {
    console.log("Current userId:", userId);
    console.log("Current preRegistrationId:", preRegistrationId);
  }, [userId, preRegistrationId]);

  return (
    <div>
      <Modal
        title={modalTitle}
        open={isOpen}
        onCancel={onClose}
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
          <Button key="cancel" onClick={onClose}>
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
              setPasswordMutation.isPending ||
              uploading
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
