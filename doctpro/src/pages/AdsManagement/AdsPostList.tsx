import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import CreateAdPost from "./CreateAdPost";
import AdsPostViewDrawer from "./AdsPostViewDrawer";
import SearchFilterDownloadButton from "../Common/SearchFilterDownloadButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdsPost {
  key: string;
  sNo: number;
  adId: string;
  adTitle: string;
  companyName: string;
  type: string;
  displayStart: string;
  endDate: string;
  description: string;
  status: string;
}

const AdsPostList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const { data: adsData, isLoading } = useQuery({
    queryKey: ["ads", currentPage, pageSize],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/ads?page=${currentPage}&limit=${pageSize}`
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  const columns: ColumnsType<AdsPost> = [
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
      render: (status: string) => {
        const colorMap: { [key: string]: string } = {
          Active: "green",
          Scheduled: "orange",
          Pending: "gold",
          Expired: "red",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",

      render: () => (
        <CommonDropdown
          onView={() => setIsViewDrawerOpen(true)}
          onEdit={() => {}}
          onDelete={() => {}}
          showDelete={false}
          showEdit={false}
        />
      ),
    },
  ];
  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["ads"] });
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Ads Post</h1>
        <Button
          type="primary"
          className="bg-button-primary hover:!bg-button-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create Ad Post
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <SearchFilterDownloadButton />

        <Table
          columns={columns}
          dataSource={adsData?.data || adsData || []}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: adsData?.total || adsData?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["8", "16", "24", "32"],
          }}
          onChange={handleTableChange}
          className="shadow-sm rounded-lg"
        />
      </div>

      <CreateAdPost open={isCreateModalOpen} onClose={handleModalClose} />
      <AdsPostViewDrawer
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        adsId={(adsData?.data?.[0]?.id || adsData?.[0]?.id) ?? ""}
      />
    </div>
  );
};

export default AdsPostList;
