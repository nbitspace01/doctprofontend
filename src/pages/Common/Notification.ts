import { NotificationInstance } from "antd/es/notification/interface";

interface NotificationOptions {
  message: string;
  description?: string;
  duration?: number;
  placement?:
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "top"
    | "bottom";
}

export const showNotification = (
  notification: NotificationInstance,
  type: "success" | "error" | "info" | "warning",
  options: NotificationOptions
) => {
  const defaultOptions: Partial<NotificationOptions> = {
    placement: "topRight",
    duration: 4,
  };

  notification[type]({
    ...defaultOptions,
    ...options,
  });
};

// Predefined notification types
export const showSuccess = (
  notification: NotificationInstance,
  options: NotificationOptions
) => {
  if (!options.message) {
    throw new Error("Message is required for success notifications");
  }
  const { message, ...restOptions } = options;
  showNotification(notification, "success", {
    message,
    ...restOptions,
  });
};

export const showError = (
  notification: NotificationInstance,
  options: NotificationOptions
) => {
  if (!options.message) {
    throw new Error("Message is required for error notifications");
  }
  const { message, ...restOptions } = options;
  showNotification(notification, "error", {
    message,
    ...restOptions,
  });
};

export const showWarning = (
  notification: NotificationInstance,
  options: NotificationOptions
) => {
  if (!options.message) {
    throw new Error("Message is required for warning notifications");
  }
  const { message, ...restOptions } = options;
  showNotification(notification, "warning", {
    message,
    ...restOptions,
  });
};

export const showInfo = (
  notification: NotificationInstance,
  options: NotificationOptions
) => {
  if (!options.message) {
    throw new Error("Message is required for info notifications");
  }
  const { message, ...restOptions } = options;
  showNotification(notification, "info", {
    message,
    ...restOptions,
  });
};
