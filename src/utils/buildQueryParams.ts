export const buildQueryParams = (
  searchValue: string,
  filterValues: Record<string, any>
) => {
  const params: string[] = [];

  // 🔍 search
  if (searchValue?.trim()) {
    params.push(`search=${encodeURIComponent(searchValue.trim())}`);
  }

  Object.entries(filterValues).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // ✅ checkbox (array) - append each separately
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((v) => {
        params.push(`${key}=${encodeURIComponent(v)}`);
      });
      return;
    }

    // ✅ text input
    if (typeof value === "string" && value.trim() !== "") {
      params.push(`${key}=${encodeURIComponent(value.trim())}`);
    }
  });

  return params.join("&");
};
