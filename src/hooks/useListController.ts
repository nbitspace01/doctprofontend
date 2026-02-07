import { useCallback, useState } from "react";

export const useListController = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const onPageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const onFilterChange = useCallback((filters: Record<string, any>) => {
    setFilterValues(filters);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    searchValue,
    filterValues,
    onPageChange,
    onSearch,
    onFilterChange,
  };
};
