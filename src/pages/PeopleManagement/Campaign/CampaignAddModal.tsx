import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface CampaignAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const CampaignAddModal: React.FC<CampaignAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const uploadProps = {
    beforeUpload: (file: UploadFile) => {
      const isVideo = file.type?.startsWith("video/");
      const isImage = file.type?.startsWith("image/");

      if (!isVideo && !isImage) {
        message.error("You can only upload image or video files!");
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title="Create New Campaign"
      open={isOpen}
      onCancel={onClose}
      width={720}
      footer={[
        <Button
          key="draft"
          className="text-blue-600"
          onClick={() => form.submit()}
        >
          Save as Draft
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Publish
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="adTitle"
          label="Ad Title"
          rules={[{ required: true, message: "Please enter ad title" }]}
        >
          <Input placeholder="Enter Ad Title" className="rounded-md" />
        </Form.Item>

        <Form.Item
          name="adType"
          label="Ad Type"
          rules={[{ required: true, message: "Please select ad type" }]}
        >
          <Select placeholder="Select Ad Type" className="rounded-md">
            <Select.Option value="banner">Banner</Select.Option>
            <Select.Option value="video">Video</Select.Option>
            <Select.Option value="popup">Popup</Select.Option>
            <Select.Option value="sponsered">Sponsered Post</Select.Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="city"
            label="City/Town"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="Enter Location" className="rounded-md" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Please select state" }]}
            >
              <Select placeholder="Select State" className="rounded-md">
                <Select.Option value="state1">State 1</Select.Option>
                <Select.Option value="state2">State 2</Select.Option>
                <Select.Option value="state3">State 3</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select country" }]}
            >
              <Select placeholder="Select Country" className="rounded-md">
                <Select.Option value="country1">Country 1</Select.Option>
                <Select.Option value="country2">Country 2</Select.Option>
                <Select.Option value="country3">Country 3</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="startDate"
            label="Start Date & Time"
            rules={[
              { required: true, message: "Please select start date and time" },
            ]}
          >
            <DatePicker
              showTime
              format="DD MMM YYYY- HH:mmA"
              className="w-full rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date & Time"
            rules={[
              { required: true, message: "Please select end date and time" },
            ]}
          >
            <DatePicker
              showTime
              format="DD MMM YYYY- HH:mmA"
              className="w-full rounded-md"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="contentType"
          label="Content Type"
          rules={[{ required: true, message: "Please select content type" }]}
        >
          <Select placeholder="Select Content Type" className="rounded-md">
            <Select.Option value="video">Video Ads</Select.Option>
            <Select.Option value="image">Image Ads</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="mediaContent"
          label="Content Stock Image/Video"
          rules={[{ required: true, message: "Please upload content" }]}
        >
          <Upload.Dragger
            {...uploadProps}
            className="p-8 bg-gray-50 rounded-md"
          >
            <p className="text-gray-600">
              <UploadOutlined className="text-2xl mb-2" />
            </p>
            <p className="text-gray-600">Upload ad post photo/video</p>
            <p className="text-gray-400 text-sm">file format jpg/mp4</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="comments" label="Comments">
          <Input.TextArea
            placeholder="Type something..."
            rows={4}
            className="rounded-md"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CampaignAddModal;
