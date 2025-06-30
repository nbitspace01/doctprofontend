import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Tag } from "antd";
import axios from "axios";
import { useState } from "react";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import HospitalRegistration from "../../Registration/Hospital/HospitalRegistration";
import ClinicViewDrawer from "./ClinicViewDrawer";

interface Hospital {
  id: string;
  name: string;
  branchLocation: string;
  address: string;
  status: "Active" | "Inactive" | "Pending" | "pending";
  logoUrl?: string;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Hospital[];
}

const ClinicsList = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const searchParam = searchValue ? `&search=${searchValue}` : "";
  const { data: apiResponse, isFetching } = useQuery({
    queryKey: ["hospitals", currentPage, pageSize, searchValue],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_URL}/api/hospital${searchParam}`,
        {
          params: {
            page: currentPage,
            limit: pageSize,
          },
        }
      );
      console.log("API hospital data", data);
      return data as ApiResponse;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const hospitals = apiResponse?.data || [];
  const total = apiResponse?.total || 0;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const columns = [
    // s no will be the index of the row
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },

    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Hospital/Clinic Name",
      dataIndex: "name",
      key: "name",

      render: (text: string, record: Hospital) => (
        <div className="flex items-center gap-2">
          {record.logoUrl ? (
            <img
              src={record.logoUrl}
              alt={text}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-button-primary text-white rounded-full flex items-center justify-center">
              {text.charAt(0)}
            </div>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Branch Location",
      dataIndex: "branchLocation",
      key: "branchLocation",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address: string) => {
        return address === "null, null, null" ? "N/A" : address || "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Active"
              ? "success"
              : status === "Inactive"
              ? "error"
              : "warning"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: Hospital) => (
        <CommonDropdown
          onView={() => {
            setSelectedHospitalId(record.id);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Hospital & Clinics Management
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
          className="bg-button-primary"
        >
          Add New Hospital & Clinics
        </Button>
      </div>

      {isModalVisible && (
        <HospitalRegistration
          isOpen={isModalVisible}
          onClose={handleCloseModal}
        />
      )}

      <div className="bg-white rounded-lg shadow w-full">
        <SearchFilterDownloadButton
          onSearch={handleSearch}
          searchValue={searchValue}
        />

        <Table
          columns={columns}
          dataSource={hospitals}
          loading={isFetching}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          className="w-full"
        />
      </div>

      {selectedHospitalId && (
        <ClinicViewDrawer
          isOpen={true}
          onClose={() => setSelectedHospitalId(null)}
          hospitalId={selectedHospitalId}
        />
      )}
    </div>
  );
};

export default ClinicsList;
