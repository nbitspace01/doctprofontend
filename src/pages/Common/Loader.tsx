import { Spin } from "antd"; // Assuming you're using Ant Design for the spinner
import React from "react";

const Loader: React.FC<{ size?: "small" | "default" | "large" }> = ({
  size = "default",
}) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Spin size={size} />
    </div>
  );
};

export default Loader;
