import React from "react";

interface FormattedDateProps {
  dateString: string;
  format: "long" | "short";
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FormattedDate: React.FC<FormattedDateProps> = ({
  dateString,
  format,
}) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return <span>Invalid date</span>;

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (format === "long") {
    return <span>{`${day} ${monthNames[month]}, ${year}`}</span>;
  } else if (format === "short") {
    // 2-digit year
    const shortYear = year.toString().slice(-2);
    // Month is 1-based for this format
    return <span>{`${day}/${month + 1}/${shortYear}`}</span>;
  }

  return <span>Invalid format</span>;
};

export default FormattedDate;
