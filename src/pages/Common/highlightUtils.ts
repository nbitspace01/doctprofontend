import React from "react";

// Function to highlight search terms in text
export const highlightText = (
  text: string,
  keyword: string
): React.ReactNode => {
  if (!keyword || !text) return text;

  // Escape special regex characters in the keyword
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedKeyword})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return React.createElement(
        "span",
        {
          key: index,
          className: "bg-yellow-200 font-semibold",
        },
        part
      );
    }
    return part;
  });
};

// Function to highlight text in table cells
export const highlightTableCell = (
  text: string,
  searchValue: string
): React.ReactNode => {
  if (!searchValue || !text) return text;
  return highlightText(text, searchValue);
};

// Function to check if text contains search term (case insensitive)
export const containsSearchTerm = (
  text: string,
  searchTerm: string
): boolean => {
  if (!searchTerm || !text) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};
