import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Modal,
  App,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useMutation } from "@tanstack/react-query";
import {
  AdsPostPayload,
  CreateAdPostProps,
} from "./adsPostTypes";
import { createAdsPostAPI, updateAdsPostAPI } from "../../api/adsPost.api";
import { showError, showSuccess } from "../Common/Notification";
import dayjs from "dayjs";
import { getCountries, getStates } from "../../api/location.api";
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

  const isEditMode = Boolean(initialData);

  /* -------------------- Location Logic -------------------- */
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const countryData = await getCountries();
        const mapped = countryData.map((c: any) => ({
          label: c.name,
          value: c.name,
          key: c.id,
        }));
        setCountries(mapped);

        if (initialData?.country) {
          const selectedCountry = mapped.find(
            (c: any) => c.value === initialData.country,
          );
          if (selectedCountry) {
            const stateData = await getStates(selectedCountry.key);
            setStates(
              stateData.map((s: any) => ({
                label: s.name,
                value: s.name,
                key: s.id,
              })),
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    if (open) fetchLocations();
  }, [open, initialData]);

  const handleCountryChange = async (value: string, option: any) => {
    try {
      const countryId = option.key;
      const stateData = await getStates(countryId);
      setStates(
        stateData.map((s: any) => ({
          label: s.name,
          value: s.name,
          key: s.id,
        })),
      );
      form.setFieldsValue({ state: undefined });
    } catch (err) {
      console.error("Failed to fetch states", err);
    }
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        ...initialData,
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
      formData.append("displayLocation", values.displayLocation);
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
      width={800}
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
