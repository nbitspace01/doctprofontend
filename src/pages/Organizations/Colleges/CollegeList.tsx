import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";

import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CollegeViewDrawer from "./CollegeViewDrawer";
import StatusBadge from "../../Common/StatusBadge";
import CommonTable from "../../../components/Common/CommonTable";

import { useListController } from "../../../hooks/useListController";
import { useCollegeListData } from "../../../hooks/useCollegeListData";
import {
  deleteCollegeApi,
  fetchCollegesApi,
} from "../../../api/college.api";

/* ---------- TYPES ---------- */

export interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  collegeName: string;
  state: string;
  district: string;
  hospitals: any[];
  createdOn: string;
  status: "Active" | "Pending" | "Unactive";
}

interface CollegeResponse {
  data: CollegeData[];
  total: number;
}

/* ---------- COMPONENT ---------- */

const CollegeList: React.FC = () => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] =
    useState<CollegeData | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);

  /* ---------- LIST CONTROLLER ---------- */
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* ---------- FETCH COLLEGES ---------- */
  const { data, isLoading } = useQuery<CollegeResponse>({
    queryKey: ["Colleges", currentPage, pageSize, searchValue, filterValues],
    queryFn: () =>
      fetchCollegesApi({
        page: currentPage,
        limit: pageSize,
        searchValue,
        filterValues,
      }),
    refetchOnWindowFocus: false,
  });

  const { tableData } = useCollegeListData({
    apiData: data,
    filterValues,
    currentPage,
    pageSize,
  });

  /* ---------- DELETE ---------- */
  const deleteMutation = useMutation({
    mutationFn: deleteCollegeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Colleges"] });
      message.success("College deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete college");
    },
  });

  /* ---------- COLUMNS ---------- */
  const columns: ColumnsType<CollegeData> = [
    { title: "S No", dataIndex: "sNo", width: 70 },

    {
      title: "College Name",
      dataIndex: "collegeName",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.logo ? (
            <img src={record.logo} className="w-10 h-10 rounded-full" />
          ) : (
            <Avatar className="bg-button-primary">
              {text?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
          <span>{text}</span>
        </div>
      ),
    },

    { title: "State", dataIndex: "state" },
    { title: "District", dataIndex: "district" },

    {
      title: "Associated Hospital",
      dataIndex: "hospitals",
      render: (hospitals: any[] = []) =>
        hospitals.length
          ? hospitals.map((h) => h?.name).join(", ")
          : "N/A",
    },

    { title: "Created On", dataIndex: "createdOn" },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <StatusBadge status={status} />,
    },

    {
      title: "Action",
      render: (_, record) => (
        <CommonDropdown
          onView={() => {
            setSelectedCollege(record);
            setIsViewOpen(true);
          }}
          onEdit={() => {
            setSelectedCollege(record);
            setIsFormOpen(true);
          }}
          onDelete={() =>
            modal.confirm({
              title: "Confirm Delete",
              content: `Delete ${record.collegeName}?`,
              okType: "danger",
              onOk: () => deleteMutation.mutate(record.id),
            })
          }
        />
      ),
    },
  ];

  /* ---------- FILTER OPTIONS ---------- */
  const filterOptions = [
    { label: "College Name", key: "name", type: "text" },
    { label: "State", key: "state", type: "text" },
    { label: "District", key: "district", type: "text" },
    {
      label: "Status",
      key: "status",
      type: "checkbox",
      options: ["Active", "Pending", "Unactive"],
    },
  ];

  /* ---------- RENDER ---------- */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Colleges</h1>
        <Button
          type="primary"
          className="bg-button-primary"
          onClick={() => {
            setSelectedCollege(null); // CREATE MODE
            setIsFormOpen(true);
          }}
        >
          <Plus /> Add College
        </Button>
      </div>

      {/* CREATE + EDIT MODAL */}
      <AddCollegeModal
        open={isFormOpen}
        initialData={selectedCollege}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCollege(null);
        }}
      />

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader size="large" />
          </div>
        ) : (
          <CommonTable
            rowKey="key"
            columns={columns}
            data={tableData}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={data?.total ?? 0}
            onPageChange={onPageChange}
            filters={filterOptions}
            onFilterChange={onFilterChange}
            onSearch={onSearch}
            searchValue={searchValue}
          />
        )}
      </div>

      {/* VIEW DRAWER */}
      {selectedCollege && (
        <CollegeViewDrawer
          open={isViewOpen}
          setOpen={setIsViewOpen}
          onClose={() => setIsViewOpen(false)}
          collegeId={selectedCollege.id}
        />
      )}
    </div>
  );
};

export default CollegeList;
