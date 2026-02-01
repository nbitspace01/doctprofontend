import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  UploadProps,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface AdsPostFormFieldsProps {
  form: any;
  countries: any[];
  states: any[];
  onCountryChange: (value: string, option: any) => void;
  fileList: any[];
  setFileList: (list: any[]) => void;
}

export const AdsPostFormFields: React.FC<AdsPostFormFieldsProps> = ({
  form,
  countries,
  states,
  onCountryChange,
  fileList,
  setFileList,
}) => {
  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: "image/*,video/*",
    beforeUpload: (file) => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("File must be under 5MB");
        return Upload.LIST_IGNORE;
      }
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          originFileObj: file,
        },
      ]);
      return false; // prevent auto upload
    },
  };

  return (
    <>
      <Form.Item
        label="Ad Title"
        name="title"
        rules={[{ required: true, message: "Please enter ad title" }]}
      >
        <Input placeholder="Enter Ad Title" />
      </Form.Item>

      <Form.Item
        label="Company Name"
        name="companyName"
        rules={[{ required: true, message: "Please enter company name" }]}
      >
        <Input placeholder="Enter Company Name" />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Ad Type"
          name="adType"
          rules={[{ required: true, message: "Please select ad type" }]}
        >
          <Select placeholder="Select Ad Type">
            <Select.Option value="Banner">Banner</Select.Option>
            <Select.Option value="Popup">Popup</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Display Location"
          name="displayLocation"
          rules={[{ required: true, message: "Please enter display location" }]}
        >
          <Input placeholder="Home Page, Sidebar, etc." />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: "Please select country" }]}
        >
          <Select
            placeholder="Select Country"
            options={countries}
            showSearch
            optionFilterProp="label"
            onChange={onCountryChange}
          />
        </Form.Item>

        <Form.Item
          label="State"
          name="state"
          rules={[{ required: true, message: "Please select state" }]}
        >
          <Select
            placeholder="Select State"
            options={states}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          label="Start Date & Time"
          name="startDate"
          rules={[{ required: true, message: "Please select start date" }]}
        >
          <DatePicker
            className="w-full"
            format="MM/DD/YYYY"
            placeholder="MM/DD/YYYY"
            onChange={() => form.setFieldsValue({ endDate: null })}
            disabledDate={(current) => {
              const today = dayjs().startOf("day");
              return current && current < today;
            }}
          />
        </Form.Item>

        <Form.Item
          label="End Date & Time"
          name="endDate"
          rules={[{ required: true, message: "Please select end date" }]}
        >
          <DatePicker
            className="w-full"
            format="MM/DD/YYYY"
            placeholder="MM/DD/YYYY"
            disabledDate={(current) => {
              const startDate = form.getFieldValue("startDate");
              const today = dayjs().startOf("day");

              if (!current) return false;

              // If start date not selected
              if (!startDate) {
                return current < today;
              }

              const start = dayjs(startDate).startOf("day");
              const maxEndDate = start.add(30, "day").endOf("day");

              return (
                current < start || // before start date
                current < today || // past dates
                current > maxEndDate // after 30 days
              );
            }}
          />
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

      <Form.Item label="Upload Media" required>
        <Upload
          {...uploadProps}
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: newFileList }) => {
            setFileList(newFileList);
            // Optional: clear or set validation hint
          }}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
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
        label="Redirect URL"
        name="redirectUrl"
        rules={[{ required: true, message: "Please enter link" }]}
      >
        <Input placeholder="https://example.com" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea rows={3} placeholder="Enter ad description..." />
      </Form.Item>
    </>
  );
};
