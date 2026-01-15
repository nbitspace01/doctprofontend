import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Avatar, Button, message, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import Loader from "../../Common/Loader";
import AddCollegeModal from "./AddCollegeModal";
import EditCollegeModal from "./EditCollegeModal";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CollegeViewDrawer from "./CollegeViewDrawer";
import StatusBadge from "../../Common/StatusBadge";
import { useListController } from "../../../hooks/useListController";
import { deleteCollegeApi, fetchCollegesApi } from "../../../api/college.api";
import { useCollegeListData } from "../../../hooks/useCollegeListData";
import CommonTable from "../../../components/Common/CommonTable";

interface CollegeData {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  collegeName: string;
  location: string;
  state: string;
  district: string;
  associatedHospital: any[];
  hospitals: any[];
  createdOn: string;
  created_at: string;
  status: "Active" | "Pending" | "Unactive";
}

interface CollegeResponse {
  data: CollegeData[];
  total: number;
}

const CollegeList: React.FC = () => {
  const { modal, message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<CollegeData | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  const { data: fetchedColleges, isLoading } = useQuery<CollegeResponse, Error>(
    {
      queryKey: [
        "Colleges",
        currentPage,
        pageSize,
        searchValue,
        filterValues, // ✅ REQUIRED
      ],
      queryFn: () =>
        fetchCollegesApi({
          page: currentPage,
          limit: pageSize,
          searchValue,
          filterValues,
        }),
      refetchOnWindowFocus: false,
    }
  );

  const { tableData } = useCollegeListData({
    apiData: fetchedColleges,
    filterValues,
    currentPage,
    pageSize,
  });

  const columns: ColumnsType<CollegeData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 70,
    },
    {
      title: "College Name",
      dataIndex: "collegeName",
      key: "collegeName",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.logo ? (
            <img
              src={record.logo}
              alt={text}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Avatar className="bg-button-primary" size={40}>
              {text.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (state) => state ?? "N/A",
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      render: (district) => district ?? "N/A",
    },
    {
      title: "Associated Hospital",
      dataIndex: "hospitals",
      key: "hospitals",
      width: 400,
      render: (hospitals: any[] = []) => (
        <div className="flex items-start gap-3">
          <span className="text-sm break-words whitespace-normal">
            {hospitals.length
              ? hospitals
                  .map((h) => h?.name)
                  .filter(Boolean)
                  .join(", ")
              : "No hospitals associated"}
          </span>
        </div>
      ),
    },

    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status || ""} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: CollegeData) => (
        <CommonDropdown
          onView={() => {
            console.log("VIEW RECORD:", record);
            setSelectedCollege(record);
            setIsOpen(true);
          }}
          onEdit={() => {
            setSelectedCollege(record);
            setIsEditModalVisible(true);
          }}
          onDelete={() => {
            modal.confirm({
              title: "Confirm Delete",
              content: `Delete ${record.collegeName}?`,
              okType: "danger",
              onOk: () => deleteMutation.mutate(record.id),
            });
          }}
        />
      ),
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollegeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Colleges"] });
      message.success("College deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      message.error("Failed to delete college");
    },
  });

  const filterOptions = [
    {
      label: "College Name",
      key: "name",
      type: "text" as const,
    },
    {
      label: "State",
      key: "state",
      type: "text" as const,
    },
    {
      label: "District",
      key: "district",
      type: "text" as const,
    },
    {
      label: "Associated Hospital",
      key: "associatedHospital",
      type: "text" as const,
    },
    {
      label: "Created On",
      key: "createdOn",
      type: "date" as const,
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Pending", "Unactive"],
    },
  ];
  console.log("filterValues", filterValues);

  const handleDownload = (format: "excel" | "csv") => {
    if (!tableData || tableData.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "College Name",
      "State",
      "District",
      "Associated Hospital",
      "Created On",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    tableData.forEach((row) => {
      const values = [
        row.sNo,
        `"${row.collegeName || "N/A"}"`,
        `"${row.state || "N/A"}"`,
        `"${row.district || "N/A"}"`,
        `"${row.hospitals?.map((h: any) => h.name).join(", ") || "N/A"}"`,
        `"${row.createdOn || "N/A"}"`,
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
    a.download = `colleges-report-${
      new Date().toISOString().split("T")[0]
    }.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Colleges</h1>
        <Button
          type="primary"
          className="bg-button-primary hover:!bg-button-primary"
          onClick={() => setIsModalVisible(true)}
        >
          <Plus /> Add New Colleges
        </Button>
      </div>

      <AddCollegeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <div className="bg-white rounded-lg shadow-sm w-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="large" />
          </div>
        ) : (
          <>
            <CommonTable
              rowKey="key"
              columns={columns}
              data={tableData}
              loading={isLoading}
              currentPage={currentPage}
              pageSize={pageSize}
              total={fetchedColleges?.total ?? 0}
              onPageChange={onPageChange}
              filters={filterOptions}
              onFilterChange={onFilterChange}
              onSearch={onSearch}
              searchValue={searchValue}
              onDownload={handleDownload}
            />
          </>
        )}
      </div>
      {selectedCollege && (
        <EditCollegeModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedCollege(null);
            queryClient.invalidateQueries({ queryKey: ["Colleges"] });
          }}
          collegeId={selectedCollege?.id ?? ""}
        />
      )}

      {selectedCollege && (
        <CollegeViewDrawer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          setOpen={setIsOpen}
          collegeId={selectedCollege.id}
        />
      )}
    </div>
  );
};

export default CollegeList;
