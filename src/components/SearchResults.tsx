import React from "react";
import { Card, Avatar, Tag, Space, Typography, Spin, Empty } from "antd";
import { SearchEntity } from "../api/searchentities.api";
import {
  getEntityTypeDisplayName,
  getEntityAvatar,
} from "../api/searchentities.api";

const { Text, Title } = Typography;

interface SearchResultsProps {
  results: SearchEntity[];
  loading: boolean;
  onEntityClick: (entity: SearchEntity) => void;
  searchKeyword?: string;
}

// Function to highlight search terms in text
const highlightText = (text: string, keyword: string): React.ReactNode => {
  if (!keyword || !text) return text;

  const regex = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

// Function to get status color
const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
      return "green";
    case "pending":
      return "orange";
    case "inactive":
      return "red";
    case "rejected":
      return "red";
    default:
      return "default";
  }
};

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onEntityClick,
  searchKeyword = "",
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Empty
          description="No results found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((entity) => (
        <Card
          key={entity.id}
          className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
          onClick={() => onEntityClick(entity)}
        >
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <Avatar
              size={48}
              src={entity.avatar || getEntityAvatar(entity)}
              className="flex-shrink-0"
            >
              {entity.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Title level={5} className="mb-0">
                  {highlightText(entity.name, searchKeyword)}
                </Title>
                <Tag color="blue">{getEntityTypeDisplayName(entity.type)}</Tag>
                {entity.status && (
                  <Tag color={getStatusColor(entity.status)}>
                    {entity.status}
                  </Tag>
                )}
              </div>

              {/* Description */}
              {entity.description && (
                <Text type="secondary" className="block mb-2">
                  {highlightText(entity.description, searchKeyword)}
                </Text>
              )}

              {/* Additional Info */}
              <Space wrap className="text-sm text-gray-600">
                {entity.email && (
                  <span>
                    <Text strong>Email:</Text>{" "}
                    {highlightText(entity.email, searchKeyword)}
                  </span>
                )}
                {entity.phone && (
                  <span>
                    <Text strong>Phone:</Text>{" "}
                    {highlightText(entity.phone, searchKeyword)}
                  </span>
                )}
                {entity.location && (
                  <span>
                    <Text strong>Location:</Text>{" "}
                    {highlightText(entity.location, searchKeyword)}
                  </span>
                )}
                {entity.createdAt && (
                  <span>
                    <Text strong>Created:</Text>{" "}
                    {new Date(entity.createdAt).toLocaleDateString()}
                  </span>
                )}
              </Space>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
