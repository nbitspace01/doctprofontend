import { DownloadOutlined, FilterFilled, RightOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Input, Space } from "antd";
import { useState } from "react";

interface FilterOption {
  label: string;
  key: string;
  options?: string[];
}

interface DownloadFilterButtonProps {
  onDownload?: (format: "excel" | "csv") => void;
  filterOptions?: FilterOption[];
  onFilterChange?: (filters: Record<string, any>) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

const DownloadFilterButton = ({
  onDownload,
  filterOptions = [],
  onFilterChange,
  onSearch,
  searchValue = "",
}: DownloadFilterButtonProps) => {
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(
    filterOptions.length > 0 ? filterOptions[0].key : null
  );
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilterValues = { ...filterValues, [key]: value };
    setFilterValues(newFilterValues);
    onFilterChange?.(newFilterValues);
  };

  const renderFilterInput = () => {
    if (!activeFilterKey) return <div className="w-48" />;

    const activeFilter = filterOptions.find(
      (option) => option.key === activeFilterKey
    );
    if (!activeFilter) return <div className="w-48" />;

    if (activeFilter.options && activeFilter.options.length > 0) {
      return (
        <div className="w-48 p-2">
          <Space direction="vertical" className="w-full">
            {activeFilter.options.map((option) => (
              <Checkbox
                key={option}
                checked={filterValues[`${activeFilterKey}_${option}`] || false}
                onChange={(e) =>
                  handleFilterChange(
                    `${activeFilterKey}_${option}`,
                    e.target.checked
                  )
                }
              >
                {option}
              </Checkbox>
            ))}
          </Space>
        </div>
      );
    }

    return (
      <div className="w-48 p-2">
        <Input
          placeholder={`Search by ${activeFilter.label}`}
          prefix={<SearchOutlined />}
          value={filterValues[activeFilterKey] || ""}
          onChange={(e) => handleFilterChange(activeFilterKey, e.target.value)}
          allowClear
        />
      </div>
    );
  };

  const filterMenu = (
    <div className="flex gap-1 bg-white p-2 shadow-lg rounded-md border">
      <div className="w-48 max-h-96 overflow-y-auto">
        <ul>
          {filterOptions.map((option) => {
            const hasOptions = option.options && option.options.length > 0;
            return (
              <li
                key={option.key}
                className={`p-2 cursor-pointer rounded-md flex justify-between items-center ${
                  activeFilterKey === option.key
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilterKey(option.key)}
              >
                {option.label}
                {hasOptions && <RightOutlined className="text-gray-400" />}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {renderFilterInput()}
      </div>
    </div>
  );

  const downloadMenu = {
    items: [
      {
        key: "excel",
        label: "Download as Excel",
        onClick: () => onDownload?.("excel"),
      },
      {
        key: "csv",
        label: "Download as CSV",
        onClick: () => onDownload?.("csv"),
      },
    ],
  };

  return (
    <div className="p-4 flex justify-between items-center border-b gap-3">
      {onSearch && (
        <Input.Search
          placeholder="Search"
          className="max-w-xs"
          allowClear
          value={searchValue}
          onChange={(e) => {
            onSearch?.(e.target.value);
          }}
          onSearch={(value) => {
            onSearch?.(value);
          }}
        />
      )}
      <div className="flex items-center gap-3">
        {onDownload && (
          <Dropdown menu={downloadMenu} trigger={["click"]}>
            <button
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 p-0 bg-transparent border-none cursor-pointer"
            >
              <DownloadOutlined />
              <span>Download Report</span>
            </button>
          </Dropdown>
        )}
        {filterOptions.length > 0 && (
          <Dropdown dropdownRender={() => filterMenu} trigger={["click"]}>
            <Button
              icon={<FilterFilled />}
              className="border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 rounded-md"
            >
              Filter by
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default DownloadFilterButton;

