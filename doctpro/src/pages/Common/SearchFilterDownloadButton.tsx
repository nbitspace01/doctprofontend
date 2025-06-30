import {
  DownloadOutlined,
  FilterFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Input, Space } from "antd";
import { useState } from "react";

const SearchFilterDownloadButton = ({
  onDownload,
  onSearch,
}: {
  onDownload?: () => void;
  onSearch?: (value: string) => void;
}) => {
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>("name");
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchOrgType, setSearchOrgType] = useState("");
  const [searchAssocLocation, setSearchAssocLocation] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const filterOptions = [
    { label: "Name", key: "name" },
    { label: "Role", key: "role" },
    { label: "Location", key: "location" },
    { label: "Organisation Type", key: "orgType" },
    { label: "Associated Location", key: "assocLocation" },
    { label: "Status", key: "status" },
  ];

  const roleOptions = ["Manager", "In-charge", "Employee"];
  const locationOptions = ["Chennai", "Bangalore", "Mumbai", "Delhi"];
  const orgTypeOptions = ["Hospital", "Clinic", "College"];
  const assocLocationOptions = ["Chennai", "Bangalore", "Mumbai", "Delhi"];
  const statusOptions = ["Active", "Pending", "Rejected"];

  const renderFilterInput = () => {
    switch (activeFilterKey) {
      case "name":
        return (
          <div>
            <Input
              placeholder="Search by Name"
              prefix={<SearchOutlined />}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
            />
          </div>
        );
      case "role":
        return (
          <div>
            <Input
              placeholder="Search by Role"
              prefix={<SearchOutlined />}
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              allowClear
              style={{ marginBottom: "10px" }}
            />
            <Space direction="vertical">
              {roleOptions.map((role) => (
                <Checkbox className="custom-checkbox" key={role}>
                  {role}
                </Checkbox>
              ))}
            </Space>
          </div>
        );
      case "location":
        return (
          <div>
            <Input
              placeholder="Search by Location"
              prefix={<SearchOutlined />}
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              allowClear
            />
            <Space direction="vertical" className="py-2">
              {locationOptions.map((location) => (
                <Checkbox className="custom-checkbox" key={location}>
                  {location}
                </Checkbox>
              ))}
            </Space>
          </div>
        );
      case "orgType":
        return (
          <div>
            <Input
              placeholder="Search by Organisation Type"
              prefix={<SearchOutlined />}
              value={searchOrgType}
              onChange={(e) => setSearchOrgType(e.target.value)}
              allowClear
            />
            <Space direction="vertical" className="py-2">
              {orgTypeOptions.map((orgType) => (
                <Checkbox className="custom-checkbox" key={orgType}>
                  {orgType}
                </Checkbox>
              ))}
            </Space>
          </div>
        );
      case "assocLocation":
        return (
          <div>
            <Input
              placeholder="Search by Associated Location"
              prefix={<SearchOutlined />}
              value={searchAssocLocation}
              onChange={(e) => setSearchAssocLocation(e.target.value)}
              allowClear
            />
            <Space direction="vertical" className="py-2">
              {assocLocationOptions.map((location) => (
                <Checkbox className="custom-checkbox" key={location}>
                  {location}
                </Checkbox>
              ))}
            </Space>
          </div>
        );
      case "status":
        return (
          <div>
            <Input
              placeholder="Search by Status"
              prefix={<SearchOutlined />}
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              allowClear
            />
            <Space direction="vertical" className="py-2">
              {statusOptions.map((status) => (
                <Checkbox className="custom-checkbox" key={status}>
                  {status}
                </Checkbox>
              ))}
            </Space>
          </div>
        );
      default:
        return <div className="w-48" />; // Return a placeholder to maintain layout
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
        onChange={(e) => onSearch?.(e.target.value)}
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
        <Dropdown dropdownRender={() => filterMenu} trigger={["click"]}>
          <Button icon={<FilterFilled />} className="flex items-center">
            Filter by
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
};

export default SearchFilterDownloadButton;
