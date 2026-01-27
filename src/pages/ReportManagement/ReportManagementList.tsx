import { Button } from "antd";
import CommonTable from "../../components/Common/CommonTable";
import { useListController } from "../../hooks/useListController";
import CommonDropdown from "../Common/CommonActionsDropdown";

const ReportManagementList = () => {
  const {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  } = useListController();

  /* -------------------- Mutation -------------------- */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJobPostApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
      message.success("Job post deleted successfully");
    },
    onError: (error: any) => {
      message.error(error?.message || "Failed to delete job post");
    },
  });

  /* -------------------- Handlers -------------------- */
  const handleView = (record: any) => {
    setSelectedJobPost(record);
    setIsViewDrawerOpen(true);
  };

  const handleDelete = (record: any) => {
    modal.confirm({
      title: "Confirm Delete",
      content: `Delete ${record.title}?`,
      okType: "danger",
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const columns = [
    {
      title: "Report ID",
      dataIndex: "reportId",
      key: "reportId",
    },
    {
      title: "Report Name",
      dataIndex: "reportName",
      key: "reportName",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
      render: (date: string) => (
        <span className="text-blue-600">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      width: 100,
      render: (_: any, record: any) => (
        <CommonDropdown
          onView={() => handleView(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Report Management</h1>
      </div>

      {/* {isModalVisible && (
        <HospitalRegistration
          isOpen={isModalVisible}
          onClose={handleCloseModal}
        />
      )} */}

      <CommonTable
        rowKey="id"
        columns={columns}
        data={hospitals}
        loading={isFetching}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalCount}
        filters={filterOptions} // you can add filterOptions like HealthCareList if needed
        searchValue={searchValue}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onDownload={handleDownload}
      />

      {/* {selectedHospital && (
        <ClinicViewDrawer
          hospitalData={selectedHospital}
          isOpen={true}
          onClose={() => setSelectedHospital(null)}
        />
      )} */}
    </div>
  );
};

export default ReportManagementList;
