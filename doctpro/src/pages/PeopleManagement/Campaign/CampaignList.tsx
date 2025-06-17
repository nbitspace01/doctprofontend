import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import SearchFilterDownloadButton from "../../Common/SearchFilterDownloadButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CampaignAddModal from "./CampaignAddModal";
import CampaignViewDrawer from "./CampaignViewDrawer";

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

const CampaignList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: adsData, isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/ads");
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  const baseColumns: ColumnsType<AdsPost> = [
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
      title: "Ad Type",
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
        />
      ),
    },
  ];
  const columns: ColumnsType<AdsPost> = baseColumns.map((column) => ({
    ...column,
    width: column.width ?? 150,
  }));

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["ads"] });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Campaign Management</h1>
        <Button
          type="primary"
          className="bg-button-primary hover:!bg-button-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create New Campaign
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <SearchFilterDownloadButton />

        <Table
          columns={columns}
          dataSource={adsData}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            total: 50,
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          className="shadow-sm rounded-lg"
        />
      </div>

      <CampaignAddModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSubmit={() => {}}
      />
      <CampaignViewDrawer
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        adsId={adsData?.[0]?.id ?? ""}
      />
    </div>
  );
};

export default CampaignList;
