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

  const allAdsPost = adsPostResponse?.data ?? [];
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
      {
        label: "Status",
        key: "status",
        options: ["Active", "Scheduled", "Pending", "Expired"],
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
      "Display Start",
      "End Date",
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
        `"${row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A"}"`,
        `"${row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A"}"`,
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Ads Post</h1>
        {currentRole !== "admin" && (
          <Button
            type="primary"
            className="bg-button-primary hover:!bg-button-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Ad Post
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm bg-white p-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full text-white">{AdsPostIcon()}</div>
            <div>
              <p className="text-gray-600 text-sm">Ads Post Count</p>
              <p className="text-2xl font-bold">
                {totalCount ?? 0}
              </p>
            </div>
          </div>
        </Card>
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
