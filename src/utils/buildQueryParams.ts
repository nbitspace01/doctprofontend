export const buildQueryParams = (
  searchValue: string,
  filterValues: Record<string, any>
) => {
  const params: string[] = [];

  if (searchValue) {
    params.push(`search=${encodeURIComponent(searchValue)}`);
  }

  Object.entries(filterValues).forEach(([key, value]) => {
    if (!value) return;

    if (!key.includes("_")) {
      params.push(`${key}=${encodeURIComponent(String(value).trim())}`);
    }
  });

  return params.join("&");
};
