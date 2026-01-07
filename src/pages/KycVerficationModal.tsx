import { useState } from "react";
import { Modal, Select, Input, Upload, Button, message } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";

const KYCVerificationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [documentType, setDocumentType] = useState(null);
  const [documentNumber, setDocumentNumber] = useState("");

  const documentTypes = [
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "national_id", label: "National ID" },
  ];

  const handleSubmit = () => {
    // Handle form submission logic here
    message.success("KYC verification submitted successfully");
    onClose();
  };

  const uploadProps = {
    name: "file",
    accept: "image/*,.pdf",
    maxSize: 2 * 1024 * 1024, // 2MB
    beforeUpload: (file: any) => {
      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        message.error("File must be smaller than 2MB!");
        return false;
      }
      return true;
    },
    onChange: (info: any) => {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined className="text-gray-500" />}
      title={<h2 className="text-xl font-semibold">KYC verification</h2>}
      width={600}
    >
      <div className="space-y-6 py-4">
        <div>
          <label
            htmlFor="docType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Type
          </label>
          <Select
            id="docType"
            placeholder="Select Document Type"
            className="w-full"
            options={documentTypes}
            value={documentType}
            onChange={setDocumentType}
          />
        </div>

        <div>
          <label
            htmlFor="docNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Document Number
          </label>
          <Input
            id="docNumber"
            placeholder="Enter Document Number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="uploadDoc"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload KYC Document
          </label>
          <Upload.Dragger {...uploadProps} className="w-full p-4">
            <p className="ant-upload-drag-icon">
              <UploadOutlined className="text-2xl text-blue-600" />
            </p>
            <p className="ant-upload-text">Upload Kyc Doc</p>
            <p className="ant-upload-hint text-gray-400">
              Image size up to 2MB
            </p>
          </Upload.Dragger>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button onClick={onClose} className="px-6 hover:bg-gray-100">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default KYCVerificationModal;
