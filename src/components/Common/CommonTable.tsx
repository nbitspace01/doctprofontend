import { useMemo } from "react";
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
  filters,
  filterValues = {},
  onFilterChange,
  onSearch,
  searchValue,
  onPageChange,
  onDownload,
}: CommonTableProps<T>) => {
  // 🔹 Apply search + filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      let matches = true;

      // Search
      if (searchValue) {
        const lowerSearch = searchValue.toLowerCase();
        const rowValues = Object.values(row)
          .filter((v) => typeof v === "string")
          .join(" ")
          .toLowerCase();
        if (!rowValues.includes(lowerSearch)) matches = false;
      }

      // Filters
      Object.entries(filterValues).forEach(([key, value]) => {
        if (!value) return;

        if (Array.isArray(value)) {
          // Checkbox filter
          if (!value.includes(row[key])) matches = false;
        } else {
          // Text filter
          if (!row[key]?.toString().toLowerCase().includes(value.toLowerCase()))
            matches = false;
        }
      });

      return matches;
    });
  }, [data, searchValue, filterValues]);

  // 🔹 Paginate filtered data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

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
            dataSource={paginatedData}
            rowKey={rowKey}
            pagination={false}
            scroll={{ x: "max-content" }}
          />

          <div className="flex justify-end my-2 py-3">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length} // 🔹 total of filtered rows
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
