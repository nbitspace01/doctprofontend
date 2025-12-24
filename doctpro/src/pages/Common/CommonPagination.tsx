import { Pagination } from "antd";
import React from "react";

interface CommonPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize?: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  pageSizeOptions?: string[];
  className?: string;
  disabled?: boolean;
}

const CommonPagination: React.FC<CommonPaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  onShowSizeChange,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions = ["10", "20", "50", "100"],
  className = "",
  disabled = false,
}) => {
  const handleChange = (page: number, size?: number) => {
    onChange(page, size);
  };

  const handleShowSizeChange = (current: number, size: number) => {
    if (onShowSizeChange) {
      onShowSizeChange(current, size);
    } else {
      onChange(1, size);
    }
  };

  return (
    <div className={`flex justify-end my-2 py-3 ${className}`}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={typeof showTotal === 'function' ? showTotal : undefined}
        pageSizeOptions={pageSizeOptions}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
        disabled={disabled}
      />
    </div>
  );
};

// Helper function to get pagination config for Ant Design Table
export const getTablePaginationConfig = (
  current: number,
  pageSize: number,
  total: number,
  onChange: (page: number, pageSize?: number) => void,
  onShowSizeChange?: (current: number, size: number) => void,
  options?: {
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
    pageSizeOptions?: string[];
  }
) => {
  return {
    current,
    pageSize,
    total,
    showSizeChanger: options?.showSizeChanger ?? true,
    showQuickJumper: options?.showQuickJumper ?? true,
    showTotal: options?.showTotal ?? ((total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`
    ),
    pageSizeOptions: options?.pageSizeOptions ?? ["10", "20", "50", "100"],
    onChange: (page: number, size?: number) => {
      onChange(page, size);
    },
    onShowSizeChange: onShowSizeChange
      ? (current: number, size: number) => {
          onShowSizeChange(current, size);
        }
      : (current: number, size: number) => {
          onChange(1, size);
        },
  };
};

export default CommonPagination;


