import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Avatar,
  Button,
  Drawer,
  message,
  Skeleton,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import { ApiHospitalData } from "../Hospital.types";
import AddHospitalModal from "./AddHospitalModal";
import { showSuccess } from "../../Common/Notification";
import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import Loader from "../../Common/Loader";
const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: ApiHospitalData[];
}

const fetchHospitals = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/api/hospital/`);
  if (!response.ok) {
    throw new Error("Failed to fetch hospitals");
  }
  return response.json();
};

interface HospitalData {
  key: string;
  sNo: number;
  name: string;
  logo: string | null;
  branchLocation: string;
  updatedOn: string;
  status: "Active" | "Inactive" | "Pending";
}

const fetchHospitalById = async (id: string): Promise<ApiHospitalData> => {
  const response = await fetch(`${API_URL}/api/hospital/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch hospital details");
  }
  return response.json();
};

const updateHospital = async (data: {
  id: string;
  hospitalData: Partial<ApiHospitalData>;
}) => {
  const response = await fetch(`${API_URL}/api/hospital/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data.hospitalData),
  });

  if (!response.ok) {
    throw new Error("Failed to update hospital");
  }

  return response.json();
};

const HospitalList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewHospitalId, setViewHospitalId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data: hospitals, isFetching } = useQuery({
    queryKey: ["hospitals"],
    queryFn: fetchHospitals,
  });

  const { data: selectedHospital } = useQuery({
    queryKey: ["hospital", selectedHospitalId],
    queryFn: () =>
      selectedHospitalId ? fetchHospitalById(selectedHospitalId) : null,
    enabled: !!selectedHospitalId,
  });

  const { data: viewHospital, isLoading: isViewLoading } = useQuery({
    queryKey: ["hospital", viewHospitalId],
    queryFn: () => (viewHospitalId ? fetchHospitalById(viewHospitalId) : null),
    enabled: !!viewHospitalId,
  });

  const updateHospitalMutation = useMutation({
    mutationFn: updateHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
    onError: (error) => {
      message.error("Failed to update hospital");
      console.error("Update error:", error);
    },
  });

  if (isFetching) {
    return <Loader size="large" />;
  }

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    console.log("message:", message);
    setIsModalOpen(false);
  };

  // Pass this function to the modal
  const handleUpdateHospital = async (
    hospitalData: Partial<ApiHospitalData>
  ) => {
    if (selectedHospitalId) {
      console.log("Updating hospital with ID:", selectedHospitalId);
      console.log("Hospital data:", hospitalData);
      const response = await updateHospitalMutation.mutateAsync({
        id: selectedHospitalId,
        hospitalData,
      });
      showSuccess(notification, {
        message: response.message,
      });
    } else {
      console.error("No hospital ID selected for update.");
    }
  };

  const tableData: HospitalData[] =
    hospitals?.data?.map((hospital, index) => ({
      key: hospital.id,
      sNo: index + 1,
      name: hospital.name,
      logo: hospital.logoUrl,
      branchLocation: hospital.branchLocation,
      updatedOn: new Date(hospital.updated_at).toLocaleDateString(),
      status: (hospital.status?.toLowerCase() === "active"
        ? "Active"
        : hospital.status?.toLowerCase() === "inactive"
        ? "Inactive"
        : "Pending") as HospitalData["status"],
    })) || [];

  const columns: ColumnsType<HospitalData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 70,
    },
    {
      title: "Hospital/Clinic Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-button-primary text-white">
            {text.charAt(0)}
          </Avatar>
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
      title: "Updated on Portal",
      dataIndex: "updatedOn",
      key: "updatedOn",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusClass = (() => {
          if (status === "Active") return "bg-green-50 text-green-600";
          if (status === "Inactive") return "bg-red-50 text-red-600";
          return "bg-orange-50 text-orange-600";
        })();

        return (
          <Tag className={`px-3 py-1 rounded-full ${statusClass}`}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",

      render: (_, record) => (
        <CommonDropdown
          onView={() => {
            setViewHospitalId(record.key);
            setIsDrawerOpen(true);
          }}
          onEdit={() => {
            setSelectedHospitalId(record.key);
            setIsModalOpen(true);
          }}
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
          onClick={() => {
            setSelectedHospitalId(null);
            setIsModalOpen(true);
          }}
          className="bg-button-primary hover:!bg-button-primary"
        >
          + Add New Hospital & Clinics
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <SearchFilterDownloadButton />

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            total: hospitals?.total ?? 0,
            pageSize: hospitals?.limit ?? 8,
            current: hospitals?.page ?? 1,
            showSizeChanger: true,
          }}
          className="shadow-sm rounded-lg"
        />
      </div>

      <Drawer
        title="Hospital & Clinics Management"
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          setViewHospitalId(null);
        }}
        open={isDrawerOpen}
        width={500}
      >
        {isViewLoading ? (
          <Skeleton active />
        ) : viewHospital ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {viewHospital.logoUrl ? (
                <img
                  src={viewHospital.logoUrl}
                  alt={viewHospital.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Avatar className="bg-button-primary">
                  {viewHospital.name?.charAt(0) || ""}
                </Avatar>
              )}
              <div>
                <h3 className="text-lg font-semibold">{viewHospital.name}</h3>
                <Tag
                  className={`px-3 py-1 rounded-full ${
                    viewHospital.isActive
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {viewHospital.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Branch Location</h4>
              <p>{viewHospital.branchLocation}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Updated On Portal</h4>
              <p>
                {viewHospital.updated_at
                  ? new Date(viewHospital.updated_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>

      <AddHospitalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHospitalId(null);
        }}
        onSuccess={() => handleSuccess("Hospital updated successfully")}
        initialData={selectedHospital}
        onUpdate={handleUpdateHospital}
        isEditing={!!selectedHospitalId}
      />
    </div>
  );
};

export default HospitalList;
