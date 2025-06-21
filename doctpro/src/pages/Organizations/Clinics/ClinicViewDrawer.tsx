import { Avatar, Drawer, Image, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  UserOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import FormattedDate from "../../Common/FormattedDate";

interface HospitalData {
  name: string;
  branchLocation: string;
  address: string;
  createdOn: string;
  status: string;
  email: string;
  phone: string;
  operationHrs: {
    day: string;
    from: string;
    to: string;
  }[];
  websiteUrl: string;
  adminContact: {
    name: string;
    email: string;
    phone: string;
  };
  documents: {
    license: string;
    adminId: string;
  };
  logoUrl: string;
  kyc: {
    adminIdProof: {
      type: string;
      url: string;
      number: string;
      status: string;
      rejectionReason: string | null;
    } | null;
    hospitalLicense: {
      type: string;
      url: string;
      number: string;
      status: string;
      rejectionReason: string | null;
    } | null;
  };
}

interface ClinicViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
}

const ClinicViewDrawer = ({
  isOpen,
  onClose,
  hospitalId,
}: ClinicViewDrawerProps) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  // Helper function to check if URL is a PDF
  const isPdfUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf");
  };

  // Helper function to get file name from URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "Document";
    } catch {
      return "Document";
    }
  };

  const { data: hospitalData, isLoading } = useQuery<HospitalData>({
    queryKey: ["hospital", hospitalId],
    queryFn: async () => {
      const response = await axios.post(`${API_URL}/api/hospital/byId`, {
        id: hospitalId,
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-gray-200 rounded-md"
            onClick={onClose}
          >
            Back
          </button>
          <button
            className="px-6 py-2 bg-button-primary text-white rounded-md"
            onClick={onClose}
          >
            Un Activate Account
          </button>
        </div>
      }
      width={800}
      title="Hospital & Clinics Management"
    >
      <div className="p-6">
        {/* Hospital Header */}
        <div className="flex items-center gap-4 mb-6 ">
          {hospitalData?.logoUrl ? (
            <Image
              src={hospitalData?.logoUrl}
              alt="Hospital Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <Avatar className="bg-button-primary  text-white">
              {hospitalData?.name?.charAt(0)}
            </Avatar>
          )}
          <h2 className="text-xl font-semibold ">{hospitalData?.name}</h2>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600">Location:</p>
            <p>{hospitalData?.branchLocation ?? "N/A"} </p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p>{hospitalData?.address ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Created on</p>
            <FormattedDate
              dateString={hospitalData?.createdOn ?? ""}
              format="long"
            />
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full">
              {hospitalData?.status ?? "N/A"}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <MailOutlined /> Email Address
            </p>
            <p>{hospitalData?.email ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 flex items-center gap-2">
              <PhoneOutlined /> Phone Number
            </p>
            <p>{hospitalData?.phone ?? "N/A"}</p>
          </div>
        </div>

        {/* Operation Hours */}
        <div className="mb-6">
          <p className="text-gray-600 flex items-center gap-2 mb-2">
            <ClockCircleOutlined /> Operation Hrs
          </p>
          <div className="grid grid-cols-2 gap-4">
            {hospitalData?.operationHrs?.map((operationHr) => (
              <p key={operationHr?.day}>
                {operationHr?.day}: {operationHr?.from ?? "N/A"} -{" "}
                {operationHr?.to ?? "N/A"}
              </p>
            ))}
          </div>
        </div>

        {/* Website */}
        <div className="mb-6">
          <p className="text-gray-600 flex items-center gap-2">
            <GlobalOutlined /> Website URL
          </p>
          <a
            href={hospitalData?.websiteUrl}
            className="text-button-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {hospitalData?.websiteUrl ?? "N/A"}
          </a>
        </div>

        {/* HR/Admin Contact */}
        <div className="mb-6">
          <p className="text-gray-600 flex items-center gap-2 mb-2">
            <UserOutlined /> HR/Admin Contacts
          </p>
          <div className="flex items-center gap-4">
            {hospitalData?.documents?.adminId ? (
              <Image
                src={hospitalData?.documents?.adminId}
                alt="Admin"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Avatar className="bg-button-primary text-white">
                {hospitalData?.adminContact?.name?.charAt(0)}
              </Avatar>
            )}
            <div className="flex mt-3 justify-around  gap-3">
              <p>{hospitalData?.adminContact?.name ?? "N/A"}</p>
              <p className="text-gray-600">
                {hospitalData?.adminContact?.email ?? "N/A"}
              </p>
              <p className="text-gray-600">
                {hospitalData?.adminContact?.phone ?? "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* KYC Documents */}
        <div>
          <p className="text-gray-600 mb-2">KYC Documents</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-2">Hospital License</p>
              {hospitalData?.kyc?.hospitalLicense &&
              hospitalData.kyc.hospitalLicense.url ? (
                isPdfUrl(hospitalData.kyc.hospitalLicense.url) ? (
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <FilePdfOutlined className="text-red-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      {hospitalData.kyc.hospitalLicense.type ||
                        getFileNameFromUrl(
                          hospitalData.kyc.hospitalLicense.url
                        )}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Status: {hospitalData.kyc.hospitalLicense.status}
                    </p>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        window.open(
                          hospitalData.kyc.hospitalLicense!.url,
                          "_blank"
                        )
                      }
                      size="small"
                    >
                      View PDF
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Status: {hospitalData.kyc.hospitalLicense.status}
                    </p>
                    <Image
                      src={hospitalData.kyc.hospitalLicense.url}
                      alt="Hospital License"
                      className="w-full rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                  No license document available
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-600 mb-2">Admin Person ID</p>
              {hospitalData?.kyc?.adminIdProof &&
              hospitalData.kyc.adminIdProof.url ? (
                isPdfUrl(hospitalData.kyc.adminIdProof.url) ? (
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <FilePdfOutlined className="text-red-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      {hospitalData.kyc.adminIdProof.type ||
                        getFileNameFromUrl(hospitalData.kyc.adminIdProof.url)}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Status: {hospitalData.kyc.adminIdProof.status}
                    </p>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        window.open(
                          hospitalData.kyc.adminIdProof!.url,
                          "_blank"
                        )
                      }
                      size="small"
                    >
                      View PDF
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Status: {hospitalData.kyc.adminIdProof.status}
                    </p>
                    <Image
                      src={hospitalData.kyc.adminIdProof.url}
                      alt="Admin ID"
                      className="w-full rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                  No ID proof available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ClinicViewDrawer;
