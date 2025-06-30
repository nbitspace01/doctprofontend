import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Avatar,
  Button,
  Drawer,
  message,
  Pagination,
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

const fetchHospitals = async (
  currentPage: number,
  pageSize: number,
  searchValue: string
): Promise<ApiResponse> => {
  const validPage = currentPage || 1;
  const validLimit = pageSize || 10;
  const searchParam = searchValue ? `&search=${searchValue}` : "";
  const response = await fetch(
    `${API_URL}/api/hospital?page=${validPage}&limit=${validLimit}${searchParam}`
  );
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
  address: string;
  status: "Active" | "Inactive" | "Pending";
}

const fetchHospitalById = async (id: string): Promise<ApiHospitalData> => {
  const response = await fetch(`${API_URL}/api/hospital/byId`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  });

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const { data: hospitals, isFetching } = useQuery<ApiResponse, Error>({
    queryKey: ["hospitals", currentPage, pageSize, searchValue],
    queryFn: () => fetchHospitals(currentPage, pageSize, searchValue),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: selectedHospital } = useQuery({
    queryKey: ["hospital", selectedHospitalId],
    queryFn: () =>
      selectedHospitalId ? fetchHospitalById(selectedHospitalId) : null,
    enabled: !!selectedHospitalId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: viewHospital, isLoading: isViewLoading } = useQuery({
    queryKey: ["hospital", viewHospitalId],
    queryFn: () => (viewHospitalId ? fetchHospitalById(viewHospitalId) : null),
    enabled: !!viewHospitalId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const updateHospitalMutation = useMutation({
    mutationFn: updateHospital,
    onSuccess: () => {
      // Invalidate all hospital-related queries
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      // Also invalidate the specific hospital query if we're viewing one
      if (viewHospitalId) {
        queryClient.invalidateQueries({
          queryKey: ["hospital", viewHospitalId],
        });
      }
      // Invalidate the selected hospital query if we're editing one
      if (selectedHospitalId) {
        queryClient.invalidateQueries({
          queryKey: ["hospital", selectedHospitalId],
        });
      }
    },
    onError: (error) => {
      message.error("Failed to update hospital");
      console.error("Update error:", error);
    },
  });

  const handleSuccess = (message: string) => {
    // Invalidate all hospital-related queries
    queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    // Also invalidate the specific hospital query if we're viewing one
    if (viewHospitalId) {
      queryClient.invalidateQueries({ queryKey: ["hospital", viewHospitalId] });
    }
    // Invalidate the selected hospital query if we're editing one
    if (selectedHospitalId) {
      queryClient.invalidateQueries({
        queryKey: ["hospital", selectedHospitalId],
      });
    }
    console.log("message:", message);
    // Close the modal after successful update
    setIsModalOpen(false);
    setSelectedHospitalId(null);
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
      // The mutation's onSuccess will handle query invalidation
    } else {
      console.error("No hospital ID selected for update.");
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const tableData: HospitalData[] =
    hospitals?.data?.map((hospital, index) => ({
      key: hospital.id,
      sNo: index + 1,
      name: hospital.name,
      logo: hospital.logoUrl,
      branchLocation: hospital.branchLocation,
      address: hospital.address,
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
      render: (text, record) => {
        // Helper function to check if logoUrl is a valid image URL
        const isValidImageUrl = (url: string | null) => {
          if (!url || url === "" || url === "null") return false;
          // Check if it's a JSON string (file metadata)
          try {
            JSON.parse(url);
            return false; // It's JSON metadata, not a valid image URL
          } catch {
            // It's not JSON, check if it's a valid URL
            return url.startsWith("http://") || url.startsWith("https://");
          }
        };

        return (
          <div className="flex items-center gap-3">
            {isValidImageUrl(record.logo) ? (
              <img
                src={record.logo!}
                alt={text}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to avatar if image fails to load
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <Avatar
              className={`bg-button-primary text-white ${
                isValidImageUrl(record.logo) ? "hidden" : ""
              }`}
            >
              {text.charAt(0)}
            </Avatar>
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: "Branch Location",
      dataIndex: "branchLocation",
      key: "branchLocation",
    },
    // {
    //   title: "Updated on Portal",
    //   dataIndex: "updatedOn",
    //   key: "updatedOn",
    // },
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
          onEdit={async () => {
            setSelectedHospitalId(record.key);
            setIsModalOpen(true);
          }}
          onDelete={() => {}}
        />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

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

      <div className="bg-white rounded-lg shadow w-full">
        <SearchFilterDownloadButton
          onSearch={handleSearch}
          searchValue={searchValue}
        />

        <Table
          columns={columns}
          dataSource={tableData}
          scroll={{ x: "max-content" }}
          pagination={false}
          loading={isFetching}
          className="shadow-sm rounded-lg"
        />
        <div className="flex justify-end my-2 mx-3 py-3">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={hospitals?.total ?? 0}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
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
        ) : viewHospital && typeof viewHospital === "object" ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {(() => {
                const isValidImageUrl = (url: string | null) => {
                  if (!url || url === "" || url === "null") return false;
                  try {
                    JSON.parse(url);
                    return false;
                  } catch {
                    return (
                      url.startsWith("http://") || url.startsWith("https://")
                    );
                  }
                };

                return isValidImageUrl(viewHospital.logoUrl) ? (
                  <img
                    src={viewHospital.logoUrl!}
                    alt={viewHospital.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <Avatar size={50} className="bg-button-primary">
                    {viewHospital.name?.charAt(0) || ""}
                  </Avatar>
                );
              })()}
              <div className="flex  items-center gap-3">
                <h3 className="text-lg font-semibold">{viewHospital.name}</h3>
                <Tag
                  className={`flex items-center justify-center mx-2 mb-2 rounded-md text-center ${
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

            {/* <div>
              <h4 className="font-medium mb-2">Address</h4>
              <p>{viewHospital.address}</p>
            </div> */}

            {/* <div>
              <h4 className="font-medium mb-2">Updated On Portal</h4>
              <p>
                {viewHospital.updated_at ? (
                  <FormattedDate
                    dateString={viewHospital.updated_at}
                    format="long"
                  />
                ) : (
                  "Not available"
                )}
              </p>
            </div> */}
          </div>
        ) : null}
      </Drawer>

      <AddHospitalModal
        key={selectedHospitalId || "new"}
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
