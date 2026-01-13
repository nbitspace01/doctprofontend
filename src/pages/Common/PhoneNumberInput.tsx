import React from "react";
import { Form, Input } from "antd";
import { MobileIcon } from "./SVG/svg.functions";

interface PhoneNumberInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  name = "phone",
  label = "Phone Number",
  placeholder = "Enter 10 digit phone number",
  required = true,
  disabled = false,
  className = "",
}) => {
  const validationRules = [
    ...(required
      ? [{ required: true, message: "Please enter phone number" }]
      : []),
    {
      validator: (_: any, value: string) => {
        if (!value) {
          return Promise.resolve();
        }
        if (!/^\d+$/.test(value)) {
          return Promise.reject(new Error("Only numbers are allowed"));
        }
        if (value.length !== 10) {
          return Promise.reject(
            new Error("Phone number must be exactly 10 digits")
          );
        }
        return Promise.resolve();
      },
    },
  ];

  return (
    <Form.Item
      label={label}
      name={name}
      rules={validationRules}
      validateTrigger={["onChange", "onBlur"]}
      className={className}
    >
      <Input
        placeholder={placeholder}
        prefix={<MobileIcon />}
        maxLength={10}
        disabled={disabled}
      />
    </Form.Item>
  );
};

export default PhoneNumberInput;
