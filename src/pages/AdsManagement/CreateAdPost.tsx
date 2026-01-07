import React, { useState } from "react";
import { Form, Input, Select, DatePicker, Upload, Button, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface CreateAdPostProps {
  open: boolean;
  onClose: () => void;
}

const CreateAdPost: React.FC<CreateAdPostProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const createAdMutation = useMutation({
    mutationFn: (adData: any) =>
      axios.post("http://localhost:3000/api/ads", adData),
    onSuccess: () => {
      form.resetFields();
      setFileList([]);
      onClose();
      // You might want to add a success notification here
    },
    onError: (error) => {
      console.error("Error creating ad:", error);
      // You might want to add an error notification here
    },
  });

  const handleSubmit = (values: any) => {
    const payload = {
      title: values.adTitle,
      companyName: values.companyName,
      hospitalId: "003aae81-8ccc-449d-8f76-bcd02b55dfec", // You might want to make this dynamic
      adType: values.adType,
      displayLocation: "Mobile App", // You might want to add this as a form field
      targetAudience: {
        role: "doctor", // You might want to add this as a form field
        country: values.country,
        state: values.state,
      },
      description: values.description,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      redirectUrl: values.link,
      imageUrl: fileList[0]?.response?.url || "", // Assuming your upload endpoint returns the URL
      createdBy: "f1d79e3b-2437-41b1-b6b6-dd383e6de048", // You might want to make this dynamic
    };

    createAdMutation.mutate(payload);
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  return (
    <Modal open={open} onCancel={onClose} width={800} footer={null}>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Create Ad Post</h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label="Ad Title"
            name="adTitle"
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
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="popup">Popup</Select.Option>
              <Select.Option value="sponsoredpost">
                Sponsored post
              </Select.Option>
            </Select>
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
              <Select.Option value="video">Video</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Upload Media"
            name="media"
            rules={[{ required: true, message: "Please upload media" }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              onPreview={handlePreview}
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
            label="Link"
            name="link"
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
            <Button onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-6"
              loading={createAdMutation.isPending}
            >
              Publish
            </Button>
            <Button className="px-6">Save as Draft</Button>
          </div>
        </Form>

        <Modal
          open={previewOpen}
          title="Preview"
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="preview" className="w-full" src={previewImage} />
        </Modal>
      </div>
    </Modal>
  );
};

export default CreateAdPost;
