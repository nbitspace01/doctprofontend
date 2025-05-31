import { DownloadOutlined, FilterFilled } from "@ant-design/icons";
import { Button, Dropdown, Input, Space } from "antd";

const SearchFilterDownloadButton = () => {
  const filterOptions = [
    { label: "Status", key: "status" },
    { label: "Name", key: "name" },
    { label: "Role", key: "role" },
    { label: "Location", key: "location" },
    { label: "Organisation Type", key: "orgType" },
    { label: "Associated Location", key: "assocLocation" },
  ];
  return (
    <div>
      <div className="p-4 flex justify-between items-center border-b">
        <Input.Search placeholder="Search" className="max-w-xs" allowClear />
        <Space>
          <Button icon={<DownloadOutlined />} className="flex items-center">
            Download Report
          </Button>
          <Dropdown menu={{ items: filterOptions }} trigger={["click"]}>
            <Button icon={<FilterFilled />} className="flex items-center">
              Filter by
            </Button>
          </Dropdown>
        </Space>
      </div>
    </div>
  );
};

export default SearchFilterDownloadButton;
