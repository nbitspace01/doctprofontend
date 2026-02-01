import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const statusLower = String(status || "").toLowerCase();
  
  const getStatusClasses = () => {
    if (statusLower === "active" || statusLower === "hired" || statusLower === "open" || statusLower === "verified" || statusLower === "approved") {
      return "text-green-600 font-semibold bg-green-50";
    }
    if (statusLower === "pending" || statusLower === "Pending" || statusLower === "PENDING") {
      return "text-orange-600 font-semibold bg-orange-50";
    }
    if(statusLower === "inactive" || statusLower === "closed" || statusLower === "expired" || statusLower === "rejected")
    return "text-red-600 font-semibold bg-red-50";
    return "text-blue-600 font-semibold bg-blue-50"
  };

  return (
    <span
      className={`text-sm px-3 py-1 rounded-full ${getStatusClasses()} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

