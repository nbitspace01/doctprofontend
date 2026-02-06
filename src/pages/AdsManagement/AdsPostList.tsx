import React, { useEffect, useMemo, useState } from "react";
import { Button, Tag, App, Spin, Card } from "antd";
import CreateAdPost from "./CreateAdPost";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListController } from "../../hooks/useListController";
import {
  deleteAdsPostAPI,
  fetchAdsPostAPI,
  getOwnAdsPostAPI,
} from "../../api/adsPost.api";
import CommonTable from "../../components/Common/CommonTable";
import StatusBadge from "../Common/StatusBadge";
import { AdsPostData, AdsPostResponse } from "./adsPostTypes";
import AdsPostViewDrawer from "./AdsPostViewDrawer";
import { roleProps } from "../../App";
import { AdsPostIcon, totalHospital } from "../Common/SVG/svg.functions";
import { Plus } from "lucide-react";
import Dashboard, { DashboardStatCard } from "../Dashboard/Dashboard";

const AdsPostList: React.FC<roleProps> = ({ role }) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- State -------------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<AdsPostData | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedAdsPost, setSelectedAdsPost] = useState<AdsPostData | null>(
    null,
  );
  const [currentRole, setCurrentRole] = useState<roleProps["role"] | null>(
    null,
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* -------------------- List Controller -------------------- */
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* -------------------- Use Effect -------------------- */
  useEffect(() => {
    const storedRole = localStorage.getItem("roleName") as roleProps["role"];
    const storedUserId = localStorage.getItem("userId") || null;
    setCurrentRole(storedRole);
    setCurrentUserId(storedUserId);

    // remove old cached queries
    queryClient.removeQueries({ queryKey: ["adspost"] });
  }, []);

  /* -------------------- Query -------------------- */
  const { data: adsPostResponse, isFetching } = useQuery<
    AdsPostResponse,
    Error
  >({
    queryKey: [
      "adspost",
      currentRole,
      currentUserId,
      currentPage,
      pageSize,
      searchValue,
      filterValues,
    ],
    queryFn: () => {
      if (currentRole !== "admin") {
        return getOwnAdsPostAPI(currentUserId)({
          page: currentPage,
          limit: pageSize,
          searchValue,
          filterValues,
        });
      } else {
        return fetchAdsPostAPI({
          page: currentPage,
          limit: pageSize,
          searchValue,
          filterValues,
        });
      }
    },
    enabled: !!currentUserId && !!currentRole,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const allAdsPost = (adsPostResponse?.data ?? []).map((ad: any) => {
    const displayLocationName =
      typeof ad.displayLocation === "string"
        ? ad.displayLocation
        : ad.displayLocation?.name ||
          ad.district ||
          ad.districtName ||
          "";

    return {
      ...ad,
      displayLocation: displayLocationName,
      displayLocationId:
        ad.displayLocationId ?? ad.districtId ?? ad.displayLocation?.id ?? null,
      districtId: ad.districtId ?? ad.displayLocation?.id ?? null,
      stateId: ad.stateId ?? ad.state?.id ?? null,
      countryId: ad.countryId ?? ad.country?.id ?? null,
    };
  });
  const totalCount = adsPostResponse?.total ?? 0;

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdsPostAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adspost"] });
      message.success("Ads Post deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete ads post");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: AdsPostData) => {
    setSelectedAdsPost(record);
    setIsViewDrawerOpen(true);
  };

  const handleEdit = (record: AdsPostData) => {
    setEditData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record: AdsPostData) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.title}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  /* -------------------- Columns -------------------- */
  const columns = useMemo(
    () => [
      {
        title: "S No",
        dataIndex: "sNo",
        key: "sNo",
        render: (_: any, __: any, index: number) => index + 1,
        width: 100,
      },
      {
        title: "Ad ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Ad Title",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Display Location",
        dataIndex: "displayLocation",
        key: "displayLocation",
      },
      {
        title: "Company Name",
        dataIndex: "companyName",
        key: "companyName",
      },
      {
        title: "Type",
        dataIndex: "adType",
        key: "adType",
      },
      {
        title: "Created By",
        dataIndex: "createdByName",
        key: "createdByName",
        render: (name: string) => (
          <span className="font-medium">{name || "N/A"}</span>
        ),
      },
      {
        title: "Display Start",
        dataIndex: "startDate",
        key: "startDate",
        render: (date: string) => {
          return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        title: "End Date",
        dataIndex: "endDate",
        key: "endDate",
        render: (date: string) => {
          return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status?: string) => <StatusBadge status={status || ""} />,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: AdsPostData) => (
          <CommonDropdown
            onView={() => handleView(record)}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  /* -------------------- Filters -------------------- */
  const filterOptions = useMemo(
    () => [
      { label: "Ads Title", key: "title", type: "text" as const },
      { label: "Company Name", key: "companyName", type: "text" as const },
      { label: "Display Location", key: "displayLocation", type: "text" as const },
      {
        label: "Ad Type",
        key: "adType",
        type: "checkbox" as const,
        options: ["Banner"],
      },
      {
        label: "Status",
        key: "status",
        type: "checkbox" as const,
        options: ["ACTIVE", "PENDING", "DRAFT", "INACTIVE", "REJECTED"],
      },
    ],
    [],
  );

  /* -------------------- Download -------------------- */
  const handleDownload = (format: "excel" | "csv") => {
    if (!allAdsPost.length) return;

    const headers = [
      "S No",
      "Ad ID",
      "Ad Title",
      "Company Name",
      "Type",
      "Created By",
      "Display Start",
      "End Date",
      "Description",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    allAdsPost.forEach((row: any, index: number) => {
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${row.id || "N/A"}"`,
        `"${row.title || "N/A"}"`,
        `"${row.companyName || "N/A"}"`,
        `"${row.adType || "N/A"}"`,
        `"${row.createdByName || "N/A"}"`,
        `"${row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A"}"`,
        `"${row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A"}"`,
        `"${row.description || "N/A"}"`,
        `"${row.status || "N/A"}"`,
      ];
      rows.push(values.join(format === "csv" ? "," : "\t"));
    });

    const content = rows.join("\n");
    const mimeType =
      format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
    const fileExtension = format === "csv" ? "csv" : "xls";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ads-post-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentRole || !currentUserId) {
    return <Spin tip="Loading..." />;
  }

  return (
    <div className="px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Ads-Post List</h1>
        {currentRole !== "admin" && (
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            className="bg-button-primary hover:!bg-blue-700 text-white font-bold rounded-lg shadow-md 
               px-5 py-6 flex items-center gap-2 transition-colors duration-200"
          >
            <Plus className="relative -top-0" />
            Add New Ads Post
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardStatCard
          title="Ads Post Count"
          value={totalCount ?? 0}
          icon={AdsPostIcon()}
          gradientFrom="blue-500"
          gradientTo="indigo-400"
        />
      </div>

      <CommonTable<AdsPostData>
        rowKey="id"
        columns={columns}
        data={allAdsPost}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={onPageChange}
        filters={filterOptions}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
        searchValue={searchValue}
        onDownload={handleDownload}
      />

      <CreateAdPost
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          console.log(editData ? "Update" : "Add", values);
          queryClient.invalidateQueries({ queryKey: ["adspost"] });
          setIsModalOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />

      {selectedAdsPost && (
        <AdsPostViewDrawer
          open={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          adsData={selectedAdsPost}
          role={role}
        />
      )}
    </div>
  );
};

export default AdsPostList;
