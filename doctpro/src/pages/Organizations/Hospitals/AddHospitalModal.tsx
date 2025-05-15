import { PictureOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { showSuccess } from "../../Common/Notification";
import { ApiHospitalData } from "../Hospital.types";

// Define the props interface
interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ApiHospitalData | null;
  onUpdate: (data: Partial<ApiHospitalData>) => void;
  isEditing: boolean;
}

const AddHospitalModal: React.FC<AddHospitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onUpdate,
  isEditing,
}) => {
  const [form] = Form.useForm();
  const [hospitalData, setHospitalData] = useState<{
    name: string;
    branchLocation: string;
    isHeadBranch: boolean;
    logoUrl: string | null;
    isActive: boolean;
  }>({
    name: "",
    branchLocation: "",
    isHeadBranch: false,
    logoUrl: null,
    isActive: true,
  });
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  useEffect(() => {
    if (isEditing && initialData) {
      form.setFieldsValue(initialData);
      setHospitalData({
        name: initialData.name,
        branchLocation: initialData.branchLocation,
        isHeadBranch: initialData.isHeadBranch,
        logoUrl: initialData.logoUrl,
        isActive: initialData.isActive,
      });
    } else {
      form.resetFields();
      const emptyData = {
        name: "",
        branchLocation: "",
        isHeadBranch: false,
        logoUrl: null,
        isActive: true,
      };
      setHospitalData(emptyData);
    }
  }, [isEditing, initialData, form]);

  const createHospital = async (values: Partial<ApiHospitalData>) => {
    const response = await fetch(`${API_URL}/api/hospital/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Failed to add hospital");
    return response.json();
  };

  const updateHospital = async (values: Partial<ApiHospitalData>) => {
    onUpdate(values);
    return { message: "Hospital updated successfully" };
  };

  const handleSubmit = async (values: Partial<ApiHospitalData>) => {
    try {
      const handler = isEditing ? updateHospital : createHospital;
      const data = await handler(values);
      showSuccess(notification, {
        message: isEditing
          ? "Hospital updated successfully"
          : "Hospital added successfully",
        description: data.message,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error handling hospital:", error);
      notification.error({
        message: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} hospital`,
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUploadedUrl = URL.createObjectURL(file);
      setHospitalData({ ...hospitalData, logoUrl: fakeUploadedUrl });
    }
  };

  // Add this function to handle form reset
  const handleClose = () => {
    // Reset both form and state to initial empty values
    const emptyData = {
      name: "",
      branchLocation: "",
      isHeadBranch: false,
      logoUrl: null,
      isActive: true,
    };

    setHospitalData(emptyData);
    form.setFieldsValue(emptyData);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit Hospital" : "Add Hospital"}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="rounded-lg"
    >
      <Form form={form} initialValues={hospitalData} onFinish={handleSubmit}>
        <div className="space-y-6 py-4">
          {/* Logo Upload Section */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {hospitalData.logoUrl ? (
                <img
                  src={hospitalData.logoUrl}
                  alt="Hospital logo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <PictureOutlined className="text-4xl text-gray-400" />
              )}
            </div>
          </div>
          <p className="text-center text-gray-500">Logo here</p>

          {/* Hospital/Clinic Name */}
          <Form.Item
            name="name"
            label="Hospital/Clinic Name"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Enter Hospital Name"
              onChange={(e) =>
                setHospitalData({ ...hospitalData, name: e.target.value })
              }
            />
          </Form.Item>

          {/* Branch Location */}
          <Form.Item
            name="branchLocation"
            label="Branch Location"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Location"
              onChange={(value) =>
                setHospitalData({ ...hospitalData, branchLocation: value })
              }
            >
              <Select.Option value="location1">Location 1</Select.Option>
              <Select.Option value="location2">Location 2</Select.Option>
              <Select.Option value="location3">Location 3</Select.Option>
            </Select>
          </Form.Item>

          {/* Head Branch Toggle */}
          <Form.Item name="isHeadBranch" label="Head Branch">
            <Switch
              onChange={(checked) =>
                setHospitalData({ ...hospitalData, isHeadBranch: checked })
              }
            />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={handleClose}
              className="px-8 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="px-8 py-2  text-white bg-button-primary hover:!bg-button-primary"
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddHospitalModal;
