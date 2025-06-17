import { PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import CollegeRegistration from "./CollegeRegistration";
import CollegeViewDrawer from "./CollegeViewDrawer";
import { useQuery } from "@tanstack/react-query";
import { fetchColleges } from "../../../api/college";
import FormattedDate from "../../Common/FormattedDate";

interface CollegeData {
  key: string;
  sNo: number;
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  contact_person_name: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  status: "active" | "inactive" | "pending";
  hospitals: any[];
  created_at: string;
  updated_at: string;
  affiliation: string | null;
  zipcode: string | null;
  logoUrl: string | null;
}

const ListCollege: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["colleges"],
    queryFn: fetchColleges,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-600";
      case "inactive":
        return "bg-red-100 text-red-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "";
    }
  };

  const columns: ColumnsType<CollegeData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
    },
    {
      title: "College Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record?.logoUrl ? (
            <img
              src={record?.logoUrl || "/default-logo.png"}
              alt={text ?? ""}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <Avatar className="bg-button-primary w-8 h-8 rounded-full mr-2 text-white">
              {text?.charAt(0) || "N/A"}
            </Avatar>
          )}
          <span>{text ?? "N/A"}</span>
        </div>
      ),
    },
    // {
    //   title: "Contact Info",
    //   key: "contact",
    //   render: (_, record) => (
    //     <div className="space-y-1">
    //       <div>Phone: {record.phone || "N/A"}</div>
    //       <div>Email: {record.email || "N/A"}</div>
    //       <div>Website: {record.website_url || "N/A"}</div>
    //     </div>
    //   ),
    // },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <div className="space-y-1">
          <div>
            {record.city || "N/A"} , {record.district ?? ""},{" "}
            {record.state ?? ""}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Contact Person",
    //   key: "contactPerson",
    //   render: (_, record) => (
    //     <div className="space-y-1">
    //       <div>Name: {record.contact_person_name || "N/A"}</div>
    //       <div>Email: {record.contact_person_email || "N/A"}</div>
    //       <div>Phone: {record.contact_person_phone || "N/A"}</div>
    //     </div>
    //   ),
    // },
    {
      title: "Affiliation",
      dataIndex: "affiliation",
      key: "affiliation",
      render: (text) => text ?? "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full ${getStatusColor(status)}`}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
        </span>
      ),
    },
    {
      title: "Created On",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (
        <FormattedDate dateString={text ?? "N/A"} format="long" />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <CommonDropdown
          onView={() => {
            setIsViewDrawerOpen(true);
            setCollegeId(record.id);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ),
    },
  ];

  if (isLoading) {
    return <div className="p-6">Loading colleges...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">Error: {(error as Error).message}</div>
    );
  }

  // Transform the data to match the table requirements
  const tableData =
    data?.data?.map((college: CollegeData, index: number) => ({
      ...college,
      key: college.id,
      sNo: index + 1,
    })) ?? [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Colleges</h1>
        <Button
          type="primary"
          className="bg-button-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusOutlined /> Add New College
        </Button>
      </div>
      <CollegeRegistration
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CollegeViewDrawer
        collegeData={data?.data?.[0] ?? null}
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        collegeId={collegeId ?? null}
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <SearchFilterDownloadButton />

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: data?.total ?? 0,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: true,
            onShowSizeChange: (_, size) => setItemsPerPage(size),
          }}
          scroll={{ x: "max-content" }}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default ListCollege;
