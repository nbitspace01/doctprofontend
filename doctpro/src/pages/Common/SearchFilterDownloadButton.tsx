import {
  DownloadOutlined,
  FilterFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Input, Space } from "antd";
import { useState } from "react";

interface FilterOption {
  label: string;
  key: string;
  type: "text" | "checkbox";
  options?: string[];
}

interface SearchFilterDownloadButtonProps {
  onDownload?: () => void;
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
      case "checkbox":
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
              style={{ marginBottom: "10px" }}
            />
            <Space direction="vertical" className="py-2">
              {activeFilter.options?.map((option) => (
                <Checkbox
                  className="custom-checkbox"
                  key={option}
                  checked={
                    filterValues[`${activeFilterKey}_${option}`] || false
                  }
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
      default:
        return <div className="w-48" />;
    }
  };

  const filterMenu = (
    <div className="flex gap-1 bg-white p-2 shadow-lg rounded-md border">
      <div className="w-48">
        <ul>
          {filterOptions.map((option) => (
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
              <span className="text-gray-400">&gt;</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-48 p-2">{renderFilterInput()}</div>
    </div>
  );

  return (
    <div className="p-4 flex justify-between items-center border-b">
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
      <Space>
        {onDownload && (
          <Button
            icon={<DownloadOutlined />}
            className="flex items-center"
            onClick={onDownload}
          >
            Download Report
          </Button>
        )}
        {filterOptions.length > 0 && (
          <Dropdown dropdownRender={() => filterMenu} trigger={["click"]}>
            <Button icon={<FilterFilled />} className="flex items-center">
              Filter by
            </Button>
          </Dropdown>
        )}
      </Space>
    </div>
  );
};

export default SearchFilterDownloadButton;

/*
Example usage:

// For Student Management
const studentFilterOptions = [
  { label: "Name", key: "name", type: "text" },
  { label: "Course", key: "course", type: "checkbox", options: ["MBBS", "BDS", "BAMS"] },
  { label: "Year", key: "year", type: "checkbox", options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
  { label: "Status", key: "status", type: "checkbox", options: ["Active", "Inactive", "Graduated"] },
];

// For Hospital Management
const hospitalFilterOptions = [
  { label: "Hospital Name", key: "hospitalName", type: "text" },
  { label: "Location", key: "location", type: "checkbox", options: ["Chennai", "Bangalore", "Mumbai", "Delhi"] },
  { label: "Type", key: "type", type: "checkbox", options: ["Government", "Private", "Trust"] },
  { label: "Status", key: "status", type: "checkbox", options: ["Active", "Pending", "Suspended"] },
];

// For Campaign Management
const campaignFilterOptions = [
  { label: "Campaign Name", key: "campaignName", type: "text" },
  { label: "Type", key: "type", type: "checkbox", options: ["Digital", "Print", "TV", "Radio"] },
  { label: "Status", key: "status", type: "checkbox", options: ["Active", "Paused", "Completed"] },
];

Usage in component:
<SearchFilterDownloadButton
  filterOptions={studentFilterOptions}
  onFilterChange={(filters) => {
    console.log('Applied filters:', filters);
    // Apply filters to your data
  }}
  onSearch={(value) => {
    console.log('Search value:', value);
    // Handle search
  }}
  onDownload={() => {
    // Handle download
  }}
/>
*/
