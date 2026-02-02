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
  districts: any[];
  onCountryChange: (value: string, option: any) => void;
  onStateChange: (value: string, option: any) => void;
  fileList: any[];
  setFileList: (list: any[]) => void;
}

export const AdsPostFormFields: React.FC<AdsPostFormFieldsProps> = ({
  form,
  countries,
  states,
  districts,
  onCountryChange,
  onStateChange,
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
          </Select>
        </Form.Item>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            onChange={onStateChange}
          />
        </Form.Item>

        <Form.Item
          label="District"
          name="district"
          rules={[{ required: true, message: "Please select district" }]}
        >
          <Select
            placeholder="Select District"
            options={districts}
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
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
            removeIcon: (
              <span className="text-red-500 text-lg cursor-pointer">
                &times;
              </span>
            ),
          }}
          className="flex justify-center m-2"
        >
          {fileList.length < 1 && (
            <div className="relative w-40 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center">
              <div className="flex flex-col items-center justify-center absolute inset-0">
                <UploadOutlined className="text-3xl text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to Upload
                </span>
              </div>
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
