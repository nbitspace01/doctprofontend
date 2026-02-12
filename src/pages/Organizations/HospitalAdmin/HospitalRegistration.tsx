import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { App, Button, Form, Modal, Upload, UploadProps } from "antd";
import React, { useEffect, useState } from "react";
import { USER_ID } from "../../Common/constant.function";
import { showError, showSuccess } from "../../Common/Notification";
import {
  createHospitalAdminApi,
  updateHospitalAdminApi,
  uploadHospitalKycApi,
} from "../../../api/hospitalAdmin.api";
import { setUserPasswordApi } from "../../../api/auth.api";
import {
  getCountries,
  getStates,
  getDistricts,
} from "../../../api/location.api";
import { HospitalData } from "./ClinicViewDrawer";
import HospitalBasicInfo from "./HospitalBasicInfo";
import HospitalKYC from "./HospitalKYC";
import HospitalPassword from "./HospitalPassword";

// First, let's add an interface for our form data
interface HospitalRegistrationData {
  name: string;
  branchLocation: string;
  type: "hospital" | "clinic";
  city?: string;
  district?: string;
  districtId?: string;
  state?: string;
  stateId?: string;
  country?: string;
  countryId?: string;
  zipcode: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  links: Array<{
    type: string;
    url: string;
  }>;
  contact_person: string;
  admin_email: string;
  admin_phone: string;
  status: string;
}

interface HospitalRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HospitalData | null;
}

const HospitalRegistration: React.FC<HospitalRegistrationProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const [preRegistrationId, setPreRegistrationId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { notification } = App.useApp();
  // State for KYC file objects
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // Location State
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setdistricts] = useState<any[]>([]);

  const findOption = (options: any[], value?: string) => {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();
    return options.find((opt) => {
      const optValue = String(opt.value ?? "").trim();
      const optKey = String(opt.key ?? "").trim();
      const optLabel = String(opt.label ?? "").trim();
      return (
        optValue === value ||
        optKey === value ||
        optLabel.toLowerCase() === normalized
      );
    });
  };

  const resolveOptionId = (options: any[], value?: string) =>
    findOption(options, value)?.value ?? value;

  const resolveOptionLabel = (options: any[], value?: string) =>
    findOption(options, value)?.label ?? value;

  // Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(
          data.map((c: any) => ({ label: c.name, value: c.id, key: c.id })),
        );
      } catch (error) {
        console.error("Failed to fetch countries", error);
      }
    };
    if (isOpen) fetchCountries();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !initialData || countries.length === 0) return;

    const preloadLocationData = async () => {
      try {
        const countryId =
          (initialData as any).countryId ??
          resolveOptionId(countries, initialData.country);
        if (!countryId) return;
        form.setFieldValue("country", countryId);

        const stateData = await getStates(countryId);
        const stateOptions = stateData.map((s: any) => ({
          label: s.name,
          value: s.id,
        }));
        setStates(stateOptions);

        const stateId =
          (initialData as any).stateId ??
          resolveOptionId(stateOptions, initialData.state);
        if (stateId) {
          form.setFieldValue("state", stateId);
        }

        if (stateId) {
          const districtData = await getDistricts(stateId);
          const districtOptions = districtData.map((d: any) => ({
            label: d.name,
            value: d.id,
          }));
          setdistricts(districtOptions);

          const districtId =
            (initialData as any).districtId ??
            (initialData as any).cityId ??
            resolveOptionId(
              districtOptions,
              (initialData as any).district ?? (initialData as any).city,
            );
          if (districtId) {
            form.setFieldValue("city", districtId);
          }

          const branchId = resolveOptionId(
            districtOptions,
            initialData.branchLocation,
          );
          if (branchId) {
            form.setFieldValue("branchLocation", branchId);
          }
        }
      } catch (err) {
        console.error("Failed to preload location data", err);
      }
    };

    preloadLocationData();
  }, [isOpen, initialData, countries]);

  // Prefill when editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        form.setFieldsValue({
          name: initialData.name,
          type: (initialData as any).type,
          branchLocation: initialData.branchLocation,
          zipcode: initialData.zipcode,
          email: initialData.email,
          phone: initialData.phone,
          website: (initialData as any).website ?? "",
          hr_full_name: initialData.hr_full_name,
          hr_email: initialData.hr_email,
          hr_phone: initialData.hr_phone,
        });

        setPreRegistrationId(initialData.id);
        setUserId(
          (initialData as any).adminUser?.id ||
            (initialData as any).adminUserId ||
            USER_ID ||
            "",
        );
        setImageUrl(initialData.logoUrl || "");
        setCurrentStep(1);

        // preload KYC display names for step 2 if present (normalized or legacy)
        const kyc = (initialData as any).kyc;
        const kycDocs = ((initialData as any).kycDocuments || []) as any[];
        const idProofDoc =
          kycDocs.find((d) =>
            String(d.type || "")
              .toLowerCase()
              .includes("id"),
          ) || kyc?.adminIdProof;
        const licenseDoc =
          kycDocs.find((d) =>
            String(d.type || "")
              .toLowerCase()
              .includes("license"),
          ) || kyc?.hospitalLicense;

        const adminIdProof = idProofDoc || kyc?.adminIdProof;
        const hospitalLicense = licenseDoc || kyc?.hospitalLicense;
        const resolveDocNumber = (doc: any) =>
          doc?.number ?? doc?.document_number;

        const adminIdProofNumber = resolveDocNumber(adminIdProof);
        if (adminIdProofNumber) {
          form.setFieldsValue({ id_proof_number: adminIdProofNumber });
        }
        if (adminIdProof?.type) {
          form.setFieldsValue({ id_proof_type: adminIdProof.type });
        }
        const hospitalLicenseNumber = resolveDocNumber(hospitalLicense);
        if (hospitalLicenseNumber) {
          form.setFieldsValue({ license_number: hospitalLicenseNumber });
        }
        if (hospitalLicense?.type) {
          form.setFieldsValue({ license_type: hospitalLicense.type });
        }
        if (adminIdProof?.url) {
          form.setFieldsValue({ id_proof_url: adminIdProof.url });
        }
        if (hospitalLicense?.url) {
          form.setFieldsValue({ license_url: hospitalLicense.url });
        }
      } else {
        // Create Mode
        form.resetFields();
        setImageUrl("");
        setCurrentStep(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleCountryChange = async (countryId: string) => {
    if (!countryId) return;

    setStates([]);
    setdistricts([]);

    // ❌ don't reset if edit preload is running
    form.setFieldValue("state", undefined);
    form.setFieldValue("city", undefined);
    form.setFieldValue("branchLocation", undefined);

    const stateData = await getStates(countryId);
    setStates(
      stateData.map((s: any) => ({
        label: s.name,
        value: s.id,
      })),
    );
  };

  const handleStateChange = async (stateId: string) => {
    try {
      setdistricts([]);
      form.setFieldValue("city", undefined);
      form.setFieldValue("branchLocation", undefined);

      if (stateId) {
        const districtData = await getDistricts(stateId);
        setdistricts(
          districtData.map((c: any) => ({
            label: c.name,
            value: c.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch districts", error);
    }
  };

  // Create
  const hospitalRegistrationMutation = useMutation({
    mutationFn: (data: any) => createHospitalAdminApi(data),
    onMutate: () => {
      setUploading(true);
    },
    onSuccess: (data: any) => {
      console.log("Hospital Data", data);
      const { hospital_id, user_id } = data;
      setPreRegistrationId(hospital_id);
      setUserId(user_id);
      setCurrentStep(currentStep + 1);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      showError(notification, {
        message: "Registration Failed",
        description:
          (error as any).response?.data?.message ||
          (error as any).message ||
          "Unknown error",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

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
      if (data.id_proof_url) {
        formData.append("id_proof_url", data.id_proof_url);
      }
      if (data.license_file) {
        formData.append("license", data.license_file);
      }
      if (data.license_url) {
        formData.append("license_url", data.license_url);
      }

      return uploadHospitalKycApi(formData);
    },
    onSuccess: (response) => {
      console.log("KYC verification successful:", response);
      setCurrentStep(currentStep + 1);
      showSuccess(notification, {
        message: "KYC submitted successfully",
        description: response?.message ?? "Operation completed successfully",
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

  const updateHospitalMutation = useMutation({
    mutationFn: (payload: any) =>
      updateHospitalAdminApi(initialData!.id, payload),
    onMutate: () => {
      setUploading(true);
    },
    onSuccess: () => {
      showSuccess(notification, {
        message: "Hospital admin updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Update failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update hospital admin",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: (data: any) => setUserPasswordApi(userId, data),
    onSuccess: async () => {
      if (preRegistrationId) {
        try {
          await updateHospitalAdminApi(preRegistrationId, {
            status: "PENDING",
          });
        } catch (err) {
          console.error("Failed to set hospital status to PENDING", err);
        }
      }
      showSuccess(notification, {
        message: "Password updated",
        description: "Password saved and status updated to PENDING",
      });
      onClose();
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Password update failed",
        description: error?.response?.data?.message || error?.message,
      });
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
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        showError(notification, {
          message: "Image must be smaller than 2MB!",
          description: "Image must be smaller than 2MB!",
        });
        return Upload.LIST_IGNORE;
      }
      setLogoFile(file as File);
      setImageUrl(URL.createObjectURL(file as File));
      return false;
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

  const renderStep1 = () => (
    <HospitalBasicInfo
      form={form}
      countries={countries}
      states={states}
      districts={districts}
      uploadProps={uploadProps}
      imageUrl={imageUrl}
      uploading={uploading}
      handleCountryChange={handleCountryChange}
      handleStateChange={handleStateChange}
    />
  );

  const renderStep2 = () => (
    <HospitalKYC
      form={form}
      idProofUploadProps={idProofUploadProps}
      licenseUploadProps={licenseUploadProps}
      idProofFile={idProofFile}
      licenseFile={licenseFile}
    />
  );

  const renderStep3 = () => (
    <HospitalPassword form={form} isEditMode={isEditMode} />
  );

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      if (currentStep === 1) {
        setUploading(true);
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append(
          "type",
          values.type ? String(values.type).toUpperCase() : "",
        );
        const countryLabel = resolveOptionLabel(countries, values.country);
        const stateLabel = resolveOptionLabel(states, values.state);
        const cityLabel = resolveOptionLabel(districts, values.city);
        const branchLabel = resolveOptionLabel(
          districts,
          values.branchLocation,
        );

        if (values.branchLocation) {
          formData.append("branchLocation", branchLabel ?? values.branchLocation);
        }
        if (values.city) {
          formData.append("districtId", values.city);
          formData.append("district", cityLabel ?? values.city);
        }
        if (values.state || stateLabel) {
          formData.append("state", stateLabel ?? values.state);
        }
        if (values.country || countryLabel) {
          formData.append("country", countryLabel ?? values.country);
        }
        formData.append("zipcode", values.zipcode);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        if (values.website) formData.append("website", values.website);
        const adminEmail = values.hr_email || values.email || "";
        const adminPhone = values.hr_phone || values.phone || "";
        const contactPerson = values.hr_full_name || values.name || "";
        formData.append("hr_full_name", values.hr_full_name);
        formData.append("hr_email", values.hr_email || "");
        formData.append("hr_phone", values.hr_phone || "");
        formData.append("admin_email", adminEmail);
        formData.append("admin_phone", adminPhone);
        formData.append("contact_person", contactPerson);
        formData.append(
          "status",
          isEditMode && initialData
            ? initialData?.status || "ACTIVE"
            : "PENDING",
        );
        const links = [{ type: "Website", url: values.website || "" }];
        formData.append("links", JSON.stringify(links));
        if (logoFile) {
          formData.append("profile_picture", logoFile);
        }

        if (isEditMode && initialData) {
          updateHospitalMutation.mutate(formData as any, {
            onSuccess: () => {
              setPreRegistrationId(initialData.id);
              setCurrentStep(2);
            },
          });
        } else {
          hospitalRegistrationMutation.mutate(formData);
        }
        // setUploading(false);
        return;
      }

      if (currentStep === 2) {
        if (!preRegistrationId) {
          showError(notification, {
            message: "Missing required registration data.",
          });
          return;
        }
        if (!userId) setUserId(USER_ID || "");

        const kycData = {
          user_id: userId,
          hospital_id: preRegistrationId,
          id_proof_type: values.id_proof_type,
          id_proof_number: values.id_proof_number,
          id_proof_file: idProofFile,
          license_type: values.license_type,
          license_number: values.license_number,
          license_file: licenseFile,
          id_proof_url: form.getFieldValue("id_proof_url"),
          license_url: form.getFieldValue("license_url"),
        };

        kycVerificationMutation.mutate(kycData);
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
      const passwordValue = values.password;
      if (isEditMode && !passwordValue) {
        showSuccess(notification, {
          message: "Hospital updated",
          description: "No password changes applied",
        });
        onClose();
        return;
      }
      if (!passwordValue) {
        showError(notification, { message: "Password required" });
        return;
      }
      setPasswordMutation.mutate({ password: passwordValue });
    } catch (error) {
      console.error("Validation failed:", error);
      showError(notification, { message: "Validation failed" });
    }
  };

  const modalTitle = isEditMode
    ? "Edit Hospital"
    : currentStep === 1
      ? "Registration"
      : currentStep === 2
        ? "KYC"
        : "Password";

  useEffect(() => {
    if (currentStep === 2 && !preRegistrationId) {
      setCurrentStep(1);
    }
  }, [currentStep, preRegistrationId]);

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
                uploading ||
                hospitalRegistrationMutation.isPending ||
                kycVerificationMutation.isPending ||
                setPasswordMutation.isPending
              }
            >
              Back
            </Button>
          ),
          <Button
            key="cancel"
            onClick={onClose}
            disabled={
              uploading ||
              hospitalRegistrationMutation.isPending ||
              kycVerificationMutation.isPending ||
              setPasswordMutation.isPending
            }
          >
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
            {currentStep === 3 ? "Submit" : "Proceed"}
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
