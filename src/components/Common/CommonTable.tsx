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
  onFilterChange,
  onSearch,
  searchValue,
  onPageChange,
  onDownload,
}: CommonTableProps<T>) => {
  return (
    <div className="bg-white rounded-lg shadow w-full">
      <SearchFilterDownloadButton
        onSearch={onSearch}
        searchValue={searchValue}
        filterOptions={filters}
        onFilterChange={onFilterChange}
        onDownload={onDownload}
      />

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader size="large" />
        </div>
      ) : (
        <>
          <Table<T>
            columns={columns}
            dataSource={data}   // ✅ DIRECT API DATA
            rowKey={rowKey}
            pagination={false}
            scroll={{ x: "max-content" }}
          />

          <div className="flex justify-end py-7 px-8">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}     // ✅ API total
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CommonTable;
