import React from "react";
import { Drawer, Button, Tag, Avatar, Image } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetchCollegeById } from "../../../api/college";
import FormattedDate from "../../Common/FormattedDate";

interface CollegeViewDrawerProps {
  visible: boolean;
  onClose: () => void;
  collegeId: string | null;
  collegeData?: {
    name: string;
    logo: string;
    location: string;
    address: string;
    createdOn: string;
    status: string;
    emailAddress: string;
    phoneNumber: string;
    // operationHrs: {
    //   weekdays: string;
    //   weekends: string;
    // };
    websiteURL: string;
    college_kyc: [];
    // kycDocuments: {
    //   collegeLicense: string;
    // };
  };
}

const CollegeViewDrawer: React.FC<CollegeViewDrawerProps> = ({
  visible,
  onClose,
  collegeId,
}) => {
  const {
    data: collegeData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["college", collegeId],
    queryFn: () => fetchCollegeById(collegeId!),
    enabled: !!collegeId,
  });

  if (isLoading) {
    return (
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">College Management</h2>
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
              type="text"
              className="!border-none"
            />
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={600}
        className="college-view-drawer"
      >
        <div className="p-4">Loading...</div>
      </Drawer>
    );
  }

  if (isError || !collegeData) {
    return (
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">College Management</h2>
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
              type="text"
              className="!border-none"
            />
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={600}
        className="college-view-drawer"
      >
        <div className="p-4 text-red-500">Failed to load college data.</div>
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">College Management</h2>
          {/* <Button
            icon={<CloseOutlined />}
            onClick={onClose}
            type="text"
            className="!border-none"
          /> */}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      className="college-view-drawer"
    >
      <div className="p-4">
        {/* College Header */}
        <div className="flex items-center gap-4 mb-6">
          {collegeData?.logo ? (
            <img
              src={collegeData?.logo || "/default-logo.png"}
              alt={collegeData?.name || "N/A"}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <Avatar className="bg-button-primary w-8 h-8 rounded-full mr-2 text-white">
              {collegeData?.name?.charAt(0) || "N/A"}
            </Avatar>
          )}
          <h3 className="text-lg font-semibold">
            {collegeData?.name || "N/A"}
          </h3>
        </div>

        {/* College Details Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-1">Location:</p>
            <p className="font-medium">
              {collegeData?.city} {collegeData?.district}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Address</p>
            <p className="font-medium">
              {collegeData?.district} {collegeData?.state}{" "}
              {collegeData?.country}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Created on</p>
            {/* <p className="font-medium">{collegeData?.created_at ?? "N/A"}</p> */}
            <FormattedDate
              dateString={collegeData?.created_at ?? "N/A"}
              format="long"
            />
          </div>
          <div>
            <p className="text-gray-600 mb-1">Status</p>
            <Tag
              color={
                collegeData?.status &&
                collegeData.status.toLowerCase() === "active"
                  ? "success"
                  : "error"
              }
            >
              {collegeData?.status ?? "N/A"}
            </Tag>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Email Address</p>
            <p className="font-medium">{collegeData?.email ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Phone Number</p>
            <p className="font-medium">{collegeData?.phone ?? "N/A"}</p>
          </div>
          {/* <div className="col-span-2">
            <p className="text-gray-600 mb-1">Operation Hrs</p> */}
          {/* <div className="grid grid-cols-2 gap-2">
              <p className="font-medium">
                Monday - Friday: {collegeData.operationHrs.weekdays || "N/A"}
              </p>
            </div> */}
          {/* </div> */}
          <div className="col-span-2">
            <p className="text-gray-600 mb-1">Website URL</p>
            <a
              href={collegeData?.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              {collegeData?.website_url ?? "N/A"}
            </a>
          </div>
        </div>

        {/* KYC Documents */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-1">KYC Documents</h4>
          <div className="border rounded-lg py-4">
            <p className="text-gray-600 mb-1">College License</p>
            {collegeData.college_kyc && collegeData.college_kyc.length > 0 ? (
              <Image
                src={collegeData.college_kyc[0].url || "/default-logo.png"}
                alt="College License"
                className="w-full h-auto"
              />
            ) : (
              <p className="text-gray-500">No KYC documents available</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button onClick={onClose} className="min-w-[100px]">
            Back
          </Button>
          <Button
            // type="primary"
            variant="outlined"
            danger
            className="min-w-[160px]"
          >
            Un Activate Account
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default CollegeViewDrawer;
