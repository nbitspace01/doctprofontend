import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Modal,
  message,
  App,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { useMutation } from "@tanstack/react-query";
import {
  AdsPostFormValues,
  AdsPostPayload,
  CreateAdPostProps,
} from "./adsPostTypes";
import { createAdsPostAPI, updateAdsPostAPI } from "../../api/adsPost.api";
import { showError, showSuccess } from "../Common/Notification";
import { uploadImageAPI } from "../../api/upload.api";
import dayjs from "dayjs";

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

  const isEditMode = Boolean(initialData);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = (file: UploadFile) => {
    setPreviewImage(file.url || "");
    setPreviewOpen(true);
  };

  /* -------------------- Upload Config -------------------- */
  const handleUpload: UploadProps["customRequest"] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      setUploading(true);

      const res = await uploadImageAPI(file as File);
      const imageUrl = res.url;
      // console.log("Image", res.url);
      form.setFieldsValue({ imageUrl });
      setFileList([
        {
          uid: (file as any).uid,
          name: (file as any).name,
          status: "done",
          url: imageUrl,
        },
      ]);

      onSuccess?.(res);
    } catch (err) {
      onError?.(err as any);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: "image/*",
    customRequest: handleUpload,
    beforeUpload: (file) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        message.error("Only JPG / PNG images allowed");
        return Upload.LIST_IGNORE;
      }

      if (file.size / 1024 / 1024 > 2) {
        message.error("Image must be under 2MB");
        return Upload.LIST_IGNORE;
      }

      return true;
    },
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
  }, [open, initialData]);

  /* -------------------- Mutations -------------------- */
  const createMutation = useMutation({
    mutationFn: (values: AdsPostFormValues) =>
      createAdsPostAPI({
        ...values,
      }),
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
        description: error.response?.data?.error || "Failed to create ads post",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: AdsPostFormValues) => {
      const payload: any = {
        ...values,
      };

      return updateAdsPostAPI(initialData!.id, payload);
    },
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
        description: error.response?.error || "Failed to update ads post",
      });
    },
  });

  /* -------------------- Submit -------------------- */
  const handleSubmit = (values: AdsPostFormValues) => {
    const payload: AdsPostPayload = {
      title: values.title,
      companyName: values.companyName,
      adType: values.adType,
      country: values.country,
      state: values.state,
      contentType: values.contentType,
      imageUrl: values.imageUrl,
      redirectUrl: values.redirectUrl,
      description: values.description,
      displayLocation: values.displayLocation,
      startDate: values.startDate.toString(),
      endDate: values.endDate.toString()
    };
    console.log(" media Url:", values.imageUrl);

    isEditMode
      ? updateMutation.mutate(payload)
      : createMutation.mutate(payload);
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
      <div className="max-w-3xl mx-auto p-6">
        <h1>{isEditMode ? "Edit Ad Post" : "Create Ad Post"}</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label="Ad Title"
            name="title"
            rules={[{ required: true, message: "Please enter ad title" }]}
          >
            <Input placeholder="Enter Ad Title" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Company Name"
            name="companyName"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input placeholder="Enter Company Name" />
          </Form.Item>

          <Form.Item
            label="Ad Type"
            name="adType"
            rules={[{ required: true, message: "Please select ad type" }]}
          >
            <Select placeholder="Select Ad Type">
              <Select.Option value="banner">Banner</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Display Location"
            name="displayLocation"
            rules={[
              { required: true, message: "Please enter display location" },
            ]}
          >
            <Input placeholder="Enter display location" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "Please select state" }]}
            >
              <Select placeholder="Select State">
                <Select.Option value="state1">State 1</Select.Option>
                <Select.Option value="state2">State 2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Please select country" }]}
            >
              <Select placeholder="Select Country">
                <Select.Option value="country1">Country 1</Select.Option>
                <Select.Option value="country2">Country 2</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Start Date & Time"
              name="startDate"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>

            <Form.Item
              label="End Date & Time"
              name="endDate"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            label="Content Type"
            name="contentType"
            rules={[{ required: true, message: "Please select content type" }]}
          >
            <Select placeholder="Select Content Type">
              <Select.Option value="image">Image</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Upload Media"
            // name="imageUrl"
            rules={[{ required: true, message: "Please upload media" }]}
          >
            <Upload
              {...uploadProps}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => {
                setFileList(fileList);

                if (fileList.length === 0) {
                  form.setFieldsValue({ imageUrl: undefined });
                }
              }}
              showUploadList={{
                showPreviewIcon: false,
                showRemoveIcon: true,
              }}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="imageUrl"
            hidden
            rules={[{ required: true, message: "Please upload media" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="redirectUrl"
            name="redirectUrl"
            rules={[{ required: true, message: "Please enter link" }]}
          >
            <Input placeholder="http://example.com" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Type Something..." />
          </Form.Item>

          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => {
                form.resetFields();
                setFileList([]);
                onCancel();
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-6"
              loading={
                uploading ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Publish
            </Button>
            <Button className="px-6">Save as Draft</Button>
          </div>
        </Form>

        {/* <Modal
          open={previewOpen}
          title="Preview"
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="preview" className="w-full" src={previewImage} />
        </Modal> */}
      </div>
    </Modal>
  );
};

export default CreateAdPost;
