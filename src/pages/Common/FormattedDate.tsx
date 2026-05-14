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

const parseDateString = (value: string): Date | null => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Supports DD/MM/YYYY and DD-MM-YYYY which are commonly stored for DOB.
  const dobMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dobMatch) {
    const day = Number(dobMatch[1]);
    const month = Number(dobMatch[2]);
    const year = Number(dobMatch[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const FormattedDate: React.FC<FormattedDateProps> = ({
  dateString,
  format,
}) => {
  const date = parseDateString(dateString);
  if (!date) return <span>Invalid date</span>;

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
