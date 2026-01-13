import { PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import CommonDropdown from "../Common/CommonActionsDropdown";
import DownloadFilterButton from "../Common/DownloadFilterButton";
import CommonPagination from "../Common/CommonPagination";

interface CollegeData {
  key: string;
  sNo: number;
  postTitle: string;
  authorName: string;
  hospitalName: string;
  postTypes: string;
  postedOn: string;
  description: string;
  tags: string[];
  privacySettings: string;
}

const PostManagementList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Active":
  //       return "bg-green-100 text-green-600";
  //     case "Inactive":
  //       return "bg-red-100 text-red-600";
  //     case "Pending":
  //       return "bg-yellow-100 text-yellow-600";
  //     default:
  //       return "";
  //   }
  // };
  console.log(isModalOpen, isViewDrawerOpen);
  const columns: ColumnsType<CollegeData> = [
    {
      title: "S No",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
    },
    {
      title: "Post Title",
      dataIndex: "postTitle",
      key: "postTitle",
    },
    {
      title: "Author Name",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Hospital Name",
      dataIndex: "hospitalName",
      key: "hospitalName",
      render: (text) => (
        <span className="text-ellipsis overflow-hidden">
          <Avatar className="bg-button-primary text-white mx-1">
            {text.charAt(0)}
          </Avatar>
          {text}
        </span>
      ),
    },
    {
      title: "Post Type",
      dataIndex: "postTypes",
      key: "postTypes",
    },
    {
      title: "Posted On",
      dataIndex: "postedOn",
      key: "postedOn",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            maxWidth: 350,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (text: string[]) => (
        <span className="text-ellipsis overflow-hidden">
          {text.map((tag) => (
            <Tag key={tag} color="blue" className="mx-1">
              {tag}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: "Privacy Settings",
      dataIndex: "privacySettings",
      key: "privacySettings",
      render: (text) => (
        <span className="text-ellipsis overflow-hidden">
          <Tag color="blue" className="mx-2">
            {text}
          </Tag>
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",

      render: () => (
        <CommonDropdown
          onView={() => setIsViewDrawerOpen(true)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ),
    },
  ];

  const data: CollegeData[] = [
    {
      key: "1",
      sNo: 1,
      postTitle: "Medical expo",
      authorName: "Dr. John Doe",
      hospitalName: "Apollo Medical College",
      postTypes: "Banner",
      postedOn: "12 Dec 2022",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      tags: ["Medical", "Expo", "Banner", "Event"],
      privacySettings: "Public",
    },
    {
      key: "2",
      sNo: 2,
      postTitle: "Apollo Medical College",
      authorName: "Apollo Medical College",
      hospitalName: "Apollo Medical College",
      postTypes: "Apollo Medical College",
      postedOn: "12 Dec 2022",
      description: "New Bangaru Nadu Colony, K.K. Nagar Chennai, Tamil...",
      tags: ["Medical", "Expo", "Banner", "Event", "Medical"],
      privacySettings: "Everyone",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Post Management</h1>
        <Button
          type="primary"
          className="bg-button-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusOutlined /> Add New Post
        </Button>
      </div>
      {/* <CollegeRegistration
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CollegeViewDrawer
        visible={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        collegeData={data[0]}
      /> */}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <DownloadFilterButton
          onSearch={(value) => setSearchValue(value)}
          searchValue={searchValue}
        />

        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: "max-content" }}
          pagination={false}
          className="mt-4"
        />
        <CommonPagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={data.length}
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            if (pageSize) {
              setItemsPerPage(pageSize);
            }
          }}
          onShowSizeChange={(current, size) => {
            setCurrentPage(1);
            setItemsPerPage(size);
          }}
        />
      </div>
    </div>
  );
};

export default PostManagementList;
