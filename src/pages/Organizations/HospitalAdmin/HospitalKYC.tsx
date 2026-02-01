import React from "react";
import { Form, Input, Select, Upload, Button, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface HospitalKYCProps {
  form: any;
  idProofUploadProps: UploadProps;
  licenseUploadProps: UploadProps;
  idProofFile: File | null;
  licenseFile: File | null;
}

const HospitalKYC: React.FC<HospitalKYCProps> = ({
  form,
  idProofUploadProps,
  licenseUploadProps,
  idProofFile,
  licenseFile,
}) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="id_proof_type"
        label="ID Proof Type"
        rules={[{ required: true, message: "Please select ID proof type" }]}
      >
        <Select placeholder="Select ID Proof Type">
          <Select.Option value="Aadhaar Card">Aadhaar Card</Select.Option>
          <Select.Option value="PAN Card">PAN Card</Select.Option>
          <Select.Option value="Voter ID">Voter ID</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="id_proof_number"
        label="ID Proof Number"
        rules={[{ required: true, message: "Please enter ID proof number" }]}
      >
        <Input placeholder="Enter ID Proof Number" />
      </Form.Item>

      <Form.Item
        name="id_proof_url"
        label={
          <div className="flex items-center gap-2">
            <span>Admin Person ID Proof</span>
            <span className="text-gray-500 text-sm">
              📁 Upload file (PDF/JPG)
            </span>
            {form.getFieldValue("id_proof_url") && (
              <a
                href={form.getFieldValue("id_proof_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs"
              >
                View current
              </a>
            )}
          </div>
        }
      >
        <Upload {...idProofUploadProps}>
          <Button icon={<UploadOutlined />} className="w-full">
            <div className="flex items-center justify-between w-full">
              <span>Choose File</span>
              {idProofFile && (
                <span className="text-gray-500">📁 {idProofFile.name}</span>
              )}
            </div>
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="license_type"
        label="License Type"
        rules={[{ required: true, message: "Please select license type" }]}
      >
        <Select placeholder="Select License Type">
          <Select.Option value="Hospital Registration Certificate">
            Hospital Registration Certificate
          </Select.Option>
          <Select.Option value="Clinic Registration Certificate">
            Clinic Registration Certificate
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="license_number"
        label="License Number"
        rules={[{ required: true, message: "Please enter license number" }]}
      >
        <Input placeholder="Enter License Number" />
      </Form.Item>

      <Form.Item
        name="license_url"
        label={
          <div className="flex items-center gap-2">
            <span>Hospital/Clinic License</span>
            <span className="text-gray-500 text-sm">
              📁 Upload file (PDF/JPG)
            </span>
            {form.getFieldValue("license_url") && (
              <a
                href={form.getFieldValue("license_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs"
              >
                View current
              </a>
            )}
          </div>
        }
      >
        <Upload {...licenseUploadProps}>
          <Button icon={<UploadOutlined />} className="w-full">
            <div className="flex items-center justify-between w-full">
              <span>Choose File</span>
              {licenseFile && (
                <span className="text-gray-500">📁 {licenseFile.name}</span>
              )}
            </div>
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default HospitalKYC;
