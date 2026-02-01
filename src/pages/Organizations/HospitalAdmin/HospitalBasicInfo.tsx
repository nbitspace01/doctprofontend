import React from "react";
import { Form, Input, Select, Upload, Button, UploadProps } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import PhoneNumberInput from "../../Common/PhoneNumberInput";

interface HospitalBasicInfoProps {
  form: any;
  countries: any[];
  states: any[];
  cities: any[];
  uploadProps: UploadProps;
  imageUrl: string;
  uploading: boolean;
  handleCountryChange: (value: string, option: any) => void;
  handleStateChange: (value: string, option: any) => void;
}

const HospitalBasicInfo: React.FC<HospitalBasicInfoProps> = ({
  form,
  countries,
  states,
  cities,
  uploadProps,
  imageUrl,
  uploading,
  handleCountryChange,
  handleStateChange,
}) => {
  return (
    <Form form={form} layout="vertical">
      <div className="flex justify-center mb-6">
        <Upload {...uploadProps}>
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserOutlined className="text-3xl text-gray-400" />
            )}
          </div>
        </Upload>
        {uploading && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Uploading...
          </div>
        )}
      </div>

      <Form.Item
        name="name"
        label={
          <span>
            Hospital/Clinic Name <span className="text-red-500">*</span>
          </span>
        }
        rules={[
          { required: true, message: "Please enter hospital/clinic name" },
        ]}
      >
        <Input placeholder="Enter Hospital/Clinic Name" />
      </Form.Item>

      <Form.Item
        name="type"
        label={
          <span>
            Type <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Please select type" }]}
      >
        <Select placeholder="Select Type">
          <Select.Option value="hospital">Hospital</Select.Option>
          <Select.Option value="clinic">Clinic</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="country"
        label={
          <span>
            Country <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Please select country" }]}
      >
        <Select
          placeholder="Select Country"
          options={countries}
          showSearch
          optionFilterProp="label"
          onChange={(value, option) => {
            form.setFieldsValue({ state: undefined, city: undefined, branchLocation: undefined });
            handleCountryChange(value, option);
          }}
        />
      </Form.Item>

      <Form.Item
        name="state"
        label={
          <span>
            State <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Please select state" }]}
      >
        <Select
          placeholder="Select State"
          options={states}
          onChange={(value, option) => {
            form.setFieldsValue({ city: undefined, branchLocation: undefined });
            handleStateChange(value, option);
          }}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        name="city"
        label={
          <span>
            City / Town
          </span>
        }
      >
        <Select
          placeholder="Select City/Town"
          options={cities}
          showSearch
          optionFilterProp="label"
          onChange={(value) => form.setFieldsValue({ branchLocation: value })}
        />
      </Form.Item>

      <Form.Item
        name="branchLocation"
        label={
          <span>
            Branch Location
          </span>
        }
      >
        <Input placeholder="Enter Branch / Locality (optional if city chosen)" />
      </Form.Item>

      <Form.Item
        name="zipcode"
        label="Zip/Postal Code"
        rules={[{ required: true, message: "Please enter zip code" }]}
      >
        <Input placeholder="Ex 567899" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter valid email" },
          ]}
        >
          <Input placeholder="surya@xyz.com" />
        </Form.Item>
        <PhoneNumberInput name="phone" label="Phone Number" />
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="website"
            label="Website URL"
            rules={[{ required: true, message: "Please enter website URL" }]}
          >
            <Input placeholder="http://www.sample.com" />
          </Form.Item>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-4">HR/Admin Person Details</h3>
        <Form.Item
          name="hr_full_name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input placeholder="Surya" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="hr_email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="surya@xyz.com" />
          </Form.Item>
          <PhoneNumberInput name="hr_phone" label="Phone Number" />
        </div>
      </div>

      {/* This hidden field will hold the uploaded logo URL (legacy support or if URL populated) */}
      <Form.Item name="logoUrl" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
};

export default HospitalBasicInfo;
