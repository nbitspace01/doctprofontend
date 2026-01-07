import { message } from "antd";

export const showMessage = {
  success: (content: string) => {
    message.success({
      content,
      duration: 3,
      style: {
        marginTop: "20px",
      },
    });
  },

  error: (content: string) => {
    message.error({
      content,
      duration: 3,
      style: {
        marginTop: "20px",
      },
    });
  },

  warning: (content: string) => {
    message.warning({
      content,
      duration: 3,
      style: {
        marginTop: "20px",
      },
    });
  },

  info: (content: string) => {
    message.info({
      content,
      duration: 3,
      style: {
        marginTop: "20px",
      },
    });
  },
};
