import React from "react";
import { Drawer, Input, Button, Form } from "antd";
import { EditOutlined } from "@ant-design/icons";

interface EditProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
}

const EditProfileDrawer: React.FC<EditProfileDrawerProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSave(values);
      onClose();
    });
  };

  return (
    <Drawer
      title="Edit Profile"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Save Profile
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          fullName: "JohnAdmin",
          email: "surya@xyz.com",
          note: "Super Admin For Hospital & College",
          phoneNumber: "+91 99999 99999",
          role: "Sub Admin",
        }}
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <img
              src="/default-avatar.png"
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
              <EditOutlined className="text-blue-600" />
            </div>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mb-6">
          JPG/PNG Format, Max Size 5MB
        </p>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, min: 3, message: "Required, Min 3 Characters" },
          ]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          label="Note"
          name="note"
          rules={[
            { required: true, min: 3, message: "Required, Min 3 Characters" },
          ]}
        >
          <Input placeholder="Enter note" />
        </Form.Item>

        <Form.Item label="Email Address" name="email">
          <Input disabled className="bg-gray-50" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item label="Role" name="role">
          <Input disabled className="bg-gray-50" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditProfileDrawer;
