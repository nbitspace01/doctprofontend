import { BellOutlined } from "@ant-design/icons";
import { Badge, Dropdown, List, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { ApiRequest } from "../Common/constant.function";

interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: string;
  message: string;
  url: string | null;
  is_read: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface NotificationComponentProps {
  userId: string;
  selectedOrgId: string;
  onNavigate?: (url: string) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  userId,
  selectedOrgId,
  onNavigate,
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const API_URL = "localhost:3000";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      const response = await ApiRequest.get(
        `${API_URL}/api/notifications/user/${userId}?page=1&limit=10`,
        {
          headers: {
            ["org-id"]: `${selectedOrgId}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      const response = await ApiRequest.get(
        `${API_URL}/api/notifications/user/${userId}/unread/count`,
        {
          headers: {
            ["org-id"]: `${selectedOrgId}`,
          },
        }
      );

      if (response.data && typeof response.data.count === "number") {
        setNotificationCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [selectedOrgId, userId]);

  const handleNotificationClick = () => {
    fetchNotifications();
  };

  const handleNotificationRead = async (notificationId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      const notificationToUpdate = notifications.find(
        (n) => n.id === notificationId
      );
      if (!notificationToUpdate || notificationToUpdate.is_read) {
        return;
      }

      const response = await ApiRequest.put(
        `${API_URL}/api/notifications/read/${notificationId}`,
        {},
        {
          headers: {
            ["org-id"]: `${selectedOrgId}`,
          },
        }
      );

      if (
        response.data &&
        response.data.unreadNotificationCount !== undefined
      ) {
        setNotificationCount(response.data.unreadNotificationCount);
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      if (notificationToUpdate.url && onNavigate) {
        onNavigate(notificationToUpdate.url);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const notificationDropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto bg-tertiary dark:bg-darkprimary p-2">
      <List
        loading={loading}
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer transition-colors ${
              item.is_read
                ? "bg-gray-100 dark:bg-darksecondary hover:bg-gray-200 dark:hover:bg-gray-800"
                : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            } rounded-lg mb-1`}
            onClick={() => !item.is_read && handleNotificationRead(item.id)}
          >
            <div className="flex items-start gap-2 w-full p-2">
              <div className="flex-1">
                <Typography.Text
                  className={`${
                    item.is_read
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-900 dark:text-gray-100 font-medium"
                  }`}
                >
                  {item.message}
                </Typography.Text>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown
      overlay={notificationDropdownContent}
      trigger={["click"]}
      placement="bottomRight"
    >
      <button
        onClick={handleNotificationClick}
        className="bg-tertiary dark:bg-black dark:text-white border border-[#96a4af] hover:bg-gray-200 text-gray-700 p-2 rounded-lg relative transition-colors"
      >
        <Badge count={notificationCount} offset={[8, 0]}>
          <BellOutlined className="text-lg" />
        </Badge>
      </button>
    </Dropdown>
  );
};

export default NotificationComponent;
