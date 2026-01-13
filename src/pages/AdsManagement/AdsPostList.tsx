import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import CreateAdPost from "./CreateAdPost";
import AdsPostViewDrawer from "./AdsPostViewDrawer";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonDropdown from "../Common/CommonActionsDropdown";
import CommonPagination from "../Common/CommonPagination";
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
  const [searchValue, setSearchValue] = useState("");
  const searchParam = searchValue ? `&search=${searchValue}` : "";
  const { data: adsData, isLoading } = useQuery({
    queryKey: ["ads", currentPage, pageSize, searchValue],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/ads?page=${currentPage}&limit=${pageSize}${searchParam}`
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const filterOptions = [
    {
      label: "Status",
      key: "status",
      options: ["Active", "Scheduled", "Pending", "Expired"],
    },
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
  };

  const handleDownload = (format: "excel" | "csv") => {
    const data = adsData?.data || adsData || [];
    if (!data || data.length === 0) {
      console.log("No data to download");
      return;
    }

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

    data.forEach((row: any, index: number) => {
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
    const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
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
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
        />

        <Table
          columns={columns}
          dataSource={adsData?.data || adsData || []}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={false}
          className="shadow-sm rounded-lg"
        />
        <CommonPagination
          current={currentPage}
          pageSize={pageSize}
          total={adsData?.total || adsData?.length || 0}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          pageSizeOptions={["8", "16", "24", "32"]}
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
