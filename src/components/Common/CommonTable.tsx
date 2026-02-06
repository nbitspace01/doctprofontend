import { Table, Pagination } from "antd";
import SearchFilterDownloadButton from "../../pages/Common/SearchFilterDownloadButton";
import Loader from "../../pages/Common/Loader";
import type { ColumnsType, TableProps } from "antd/es/table";

export interface CommonTableProps<T> extends TableProps<T> {
  data: T[];
  columns: ColumnsType<T>;
  rowKey: string;

  loading?: boolean;

  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size?: number) => void;

  filters?: any[];
  filterValues?: Record<string, any>; // 🔹 current applied filters
  onFilterChange?: (filters: Record<string, any>) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  onDownload?: (format: "csv" | "excel") => void;
}

const CommonTable = <T extends { [key: string]: any }>({
  data,
  columns,
  rowKey,
  loading,
  currentPage,
  pageSize,
  total,
  filters,
  filterValues,
  onFilterChange,
  onSearch,
  searchValue,
  onPageChange,
  onDownload,
}: CommonTableProps<T>) => {
  return (
    <div className="bg-white rounded-lg shadow w-full overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchFilterDownloadButton
          onSearch={onSearch}
          searchValue={searchValue}
          filterOptions={filters}
          onFilterChange={onFilterChange}
          filterValues={filterValues}
          onDownload={onDownload}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader size="large" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table<T>
              columns={columns}
              dataSource={data} // ✅ DIRECT API DATA
              rowKey={rowKey}
              pagination={false}
              scroll={{ x: "max-content" }}
              className="custom-header"
            />
          </div>
          

          <div className="w-full flex justify-center sm:justify-end py-4 px-4 sm:px-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              size="small"
              className="!text-blue-800 !border-blue-800 !hover:bg-blue-600 !hover:text-white"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CommonTable;
