import {
  DownloadOutlined,
  FilterFilled,
  SearchOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Input, Space, DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface FilterOption {
  label: string;
  key: string;
  type: "text" | "checkbox" | "date";
  options?: string[];
}

interface SearchFilterDownloadButtonProps {
  onDownload?: (format: "excel" | "csv") => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (filters: Record<string, any>) => void;
}

const SearchFilterDownloadButton = ({
  onDownload,
  onSearch,
  searchValue = "",
  filterOptions = [],
  onFilterChange,
}: SearchFilterDownloadButtonProps) => {
  const [localSearch, setLocalSearch] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);

  // Reset active filter when options change
  useEffect(() => {
    if (filterOptions.length > 0) {
      setActiveFilterKey(filterOptions[0].key);
    } else {
      setActiveFilterKey(null);
    }
  }, [filterOptions]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilterValues = { ...filterValues, [key]: value };
    setFilterValues(newFilterValues);
    onFilterChange?.(newFilterValues);
  };

  const handleCheckboxChange = (
    key: string,
    option: string,
    checked: boolean,
  ) => {
    const currentValues = Array.isArray(filterValues[key])
      ? filterValues[key]
      : [];
    let newValues;
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((v: string) => v !== option);
    }
    handleFilterChange(key, newValues.length > 0 ? newValues : null);
  };

  const renderFilterInput = () => {
    if (!activeFilterKey) return <div className="w-48" />;

    const activeFilter = filterOptions.find(
      (option) => option.key === activeFilterKey,
    );
    if (!activeFilter) return <div className="w-48" />;

    switch (activeFilter.type) {
      case "text":
        return (
          <div>
            <Input
              placeholder={`Search by ${activeFilter.label}`}
              prefix={<SearchOutlined />}
              value={filterValues[activeFilterKey] || ""}
              onChange={(e) =>
                handleFilterChange(activeFilterKey, e.target.value)
              }
              allowClear
            />
          </div>
        );
      case "date":
        return (
          <div>
            <DatePicker
              placeholder={`Select ${activeFilter.label}`}
              className="w-full"
              format="DD/MM/YYYY"
              value={
                filterValues[activeFilterKey]
                  ? dayjs(filterValues[activeFilterKey])
                  : null
              }
              onChange={(date: Dayjs | null) => {
                handleFilterChange(
                  activeFilterKey,
                  date ? date.format("YYYY-MM-DD") : null,
                );
              }}
              allowClear
            />
          </div>
        );
      case "checkbox":
        const searchTerm = localSearch[activeFilterKey] || "";
        const filteredOptions =
          activeFilter.options?.filter((opt) =>
            opt.toLowerCase().includes(searchTerm.toLowerCase()),
          ) || [];

        return (
          <div>
            <Input
              placeholder={`Search in ${activeFilter.label}`}
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) =>
                setLocalSearch({
                  ...localSearch,
                  [activeFilterKey]: e.target.value,
                })
              }
              allowClear
              style={{ marginBottom: "10px" }}
            />
            <div className="max-h-60 overflow-y-auto">
              <Space direction="vertical" className="w-full">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <Checkbox
                      className="custom-checkbox w-full"
                      key={option}
                      checked={(filterValues[activeFilterKey] || []).includes(
                        option,
                      )}
                      onChange={(e) =>
                        handleCheckboxChange(
                          activeFilterKey,
                          option,
                          e.target.checked,
                        )
                      }
                    >
                      {option}
                    </Checkbox>
                  ))
                ) : (
                  <div className="text-gray-400 text-xs text-center py-2">
                    No options found
                  </div>
                )}
              </Space>
            </div>
          </div>
        );
      default:
        return <div className="w-48" />;
    }
  };

  const filterMenu = (
    <div
      className="flex gap-1 bg-white p-2 shadow-lg rounded-md border"
      style={{ minWidth: "400px" }}
    >
      <div className="w-48 border-r">
        <ul className="m-0 p-0 list-none">
          {filterOptions.map((option) => (
            <li
              key={option.key}
              className={`p-2 cursor-pointer rounded-md flex justify-between items-center ${
                activeFilterKey === option.key
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveFilterKey(option.key)}
            >
              {option.label}
              <span className="text-gray-400">&gt;</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-52 p-2">{renderFilterInput()}</div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      {/* Left: Search Input */}
      <div className="w-full sm:w-auto flex-1">
        <Input.Search
          placeholder="Search"
          className="w-full sm:max-w-xs"
          allowClear
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          onSearch={(value) => onSearch?.(value)}
        />
      </div>

      {/* Right: Buttons */}
      <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
        {onDownload && (
          <Dropdown
            menu={{
              items: [
                {
                  key: "csv",
                  label: "Download as CSV",
                  icon: <FileTextOutlined />,
                  onClick: () => onDownload("csv"),
                },
                {
                  key: "excel",
                  label: "Download as Excel",
                  icon: <FileExcelOutlined />,
                  onClick: () => onDownload("excel"),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<DownloadOutlined />}
              className="flex items-center text-blue-600 font-bold rounded hover:!bg-blue-600 hover:!text-white rounded-lg"
            >
              Download Report
            </Button>
          </Dropdown>
        )}

        {filterOptions.length > 0 && (
          <Dropdown dropdownRender={() => filterMenu} trigger={["click"]}>
            <Button
              type="default"
              icon={<FilterFilled />}
              className="flex items-center text-blue-600 border border-blue-600 font-bold rounded whitespace-nowrap
             hover:!bg-blue-600 hover:!text-white transition-colors duration-200 rounded-lg"
            >
              Filter by
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default SearchFilterDownloadButton;
