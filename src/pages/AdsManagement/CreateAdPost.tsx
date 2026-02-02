import React, { useEffect, useState } from "react";
import { Form, Button, Modal, App } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useMutation } from "@tanstack/react-query";
import { AdsPostPayload, CreateAdPostProps } from "./adsPostTypes";
import { createAdsPostAPI, updateAdsPostAPI } from "../../api/adsPost.api";
import { showError, showSuccess } from "../Common/Notification";
import dayjs from "dayjs";
import { getCountries, getDistricts, getStates } from "../../api/location.api";
import { AdsPostFormFields } from "./AdsPostFormFields";

const CreateAdPost: React.FC<CreateAdPostProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [countries, setCountries] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [states, setStates] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { label: string; value: string; key: string }[]
  >([]);

  const isEditMode = Boolean(initialData);

  /* -------------------- Location Logic -------------------- */
  useEffect(() => {
    if (!open) return;

    const setupEditMode = async () => {
      form.resetFields();
      setFileList([]);
      setStates([]);
      setDistricts([]);

      // 1️⃣ Fetch countries
      const countryData = await getCountries();
      const mappedCountries = countryData.map((c: any) => ({
        label: c.name,
        value: c.id,
      }));
      setCountries(mappedCountries);

      if (initialData) {
        const initialValues: any = {
          ...initialData,
          startDate: initialData.startDate
            ? dayjs(initialData.startDate)
            : null,
          endDate: initialData.endDate ? dayjs(initialData.endDate) : null,
          imageUrl: initialData.imageUrl || null,
          country: initialData.country,
        };

        // 2️⃣ Fetch states for country
        if (initialData.country) {
          const stateData = await getStates(initialData.country);
          const mappedStates = stateData.map((s: any) => ({
            label: s.name,
            value: s.id,
          }));
          setStates(mappedStates);
          initialValues.state = initialData.state;

          // 3️⃣ Fetch districts for state
          if (initialData.state) {
            const districtData = await getDistricts(initialData.state);
            const mappedDistricts = districtData.map((d: any) => ({
              label: d.name,
              value: d.id,
            }));
            setDistricts(mappedDistricts);
            initialValues.district = initialData.displayLocation;
          }
        }

        // 4️⃣ Set form values AFTER options loaded
        form.setFieldsValue(initialValues);

        // 5️⃣ Set file list if image exists
        if (initialData.imageUrl) {
          setFileList([
            {
              uid: "-1",
              name: "image",
              status: "done",
              url: initialData.imageUrl,
            },
          ]);
        }
      }
    };

    setupEditMode();
  }, [open, initialData, form]);

  const handleCountryChange = async (value: string, option: any) => {
    try {
      const countryId = option.key;
      const stateData = await getStates(countryId);
      const mappedStates = stateData.map((s: any) => ({
        label: s.name,
        value: s.name,
        key: s.id,
      }));
      setStates(mappedStates);

      // reset state & district when country changes
      form.setFieldsValue({ state: undefined, district: undefined });
      setDistricts([]);
    } catch (err) {
      console.error("Failed to fetch states", err);
    }
  };
  const handleStateChange = async (value: string, option: any) => {
    try {
      const stateId = option.key;
      const districtData = await getDistricts(stateId);
      setDistricts(
        districtData.map((d: any) => ({
          label: d.name,
          value: d.name,
          key: d.id,
        })),
      );

      // reset district field
      form.setFieldsValue({ district: undefined });
    } catch (err) {
      console.error("Failed to fetch districts", err);
    }
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        district: initialData.displayLocation,
        startDate: dayjs(initialData.startDate),
        endDate: dayjs(initialData.endDate),
        imageUrl: initialData.imageUrl,
      });

      if (initialData.imageUrl) {
        setFileList([
          {
            uid: "-1",
            name: "image",
            status: "done",
            url: initialData.imageUrl,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [open, initialData, form]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (payload: AdsPostPayload) => createAdsPostAPI(payload),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Ads Post Created Successfully",
        description: data.message,
      });
      form.resetFields();
      setFileList([]);
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to create ads post",
        description:
          error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create ads post",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: AdsPostPayload) =>
      updateAdsPostAPI(initialData!.id, payload),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: "Ads Post Updated Successfully",
        description: data.message,
      });
      form.resetFields();
      setFileList([]);
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: "Failed to update ads post",
        description:
          error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update ads post",
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (forcedStatus?: string) => {
    try {
      setUploading(true);

      const values = await form.validateFields();

      // 🔒 Validate file for create mode
      if (!isEditMode && !fileList.length) {
        showError(notification, {
          message: "Media Required",
          description: "Please upload an image or video",
        });
        return;
      }

      const formData = new FormData();

      // Append normal fields
      formData.append("title", values.title);
      formData.append("companyName", values.companyName);
      formData.append("adType", values.adType);
      formData.append("country", values.country);
      formData.append("state", values.state);
      formData.append("contentType", values.contentType);
      formData.append("redirectUrl", values.redirectUrl);
      formData.append("description", values.description);
      formData.append("displayLocation", values.district);
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());

      const userId = localStorage.getItem("userId");
      if (userId) {
        formData.append("createdBy", userId);
      }

      formData.append(
        "status",
        forcedStatus || (isEditMode ? initialData?.status! : "DRAFT"),
      );

      // 🔥 Append file ONLY if selected and it is a new file (has originFileObj)
      if (fileList[0]?.originFileObj) {
        formData.append("media", fileList[0].originFileObj);
      }

      if (isEditMode) {
        updateMutation.mutate(formData as any);
      } else {
        createMutation.mutate(formData as any);
      }
    } catch (error: any) {
      if (error.errorFields) {
        showError(notification, {
          message: "Validation Error",
          description: error.errorFields[0]?.errors[0],
        });
      } else {
        showError(notification, {
          message: "Submission Error",
          description: error.message,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setFileList([]);
        onCancel();
      }}
      width={600}
      footer={null}
    >
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Edit Ad Post" : "Create Ad Post"}
        </h2>
        <Form
          form={form}
          layout="vertical"
          className="space-y-2"
          initialValues={{
            status: "DRAFT",
            contentType: "image",
            adType: "Banner",
          }}
        >
          <AdsPostFormFields
            form={form}
            countries={countries}
            states={states}
            districts={districts}
            onStateChange={handleStateChange}
            onCountryChange={handleCountryChange}
            fileList={fileList}
            setFileList={setFileList}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={() => {
                form.resetFields();
                setFileList([]);
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-100"
              onClick={() => handleSubmit("DRAFT")}
              loading={
                uploading ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit("PUBLISH")}
              loading={
                uploading ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {isEditMode ? "Update & Publish" : "Publish"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateAdPost;
