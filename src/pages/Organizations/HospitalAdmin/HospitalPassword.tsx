import React from "react";
import { Form, Input } from "antd";
import { strongPasswordValidator } from "../../../utils/password.validator";

interface HospitalPasswordProps {
  form: any;
  isEditMode: boolean;
}

const HospitalPassword: React.FC<HospitalPasswordProps> = ({
  form,
  isEditMode,
}) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="password"
        label="New Password"
        rules={[
          ...(isEditMode
            ? []
            : [
                {
                  required: true,
                  message: "Please enter new password",
                },
              ]),
          {
            validator: strongPasswordValidator(),
          },
        ]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={["password"]}
        rules={[
          {
            required: !isEditMode,
            message: "Please confirm your password",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const pwd = getFieldValue("password");
              if (!pwd && !value) {
                return Promise.resolve();
              }
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("The passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm password" />
      </Form.Item>
    </Form>
  );
};

export default HospitalPassword;
