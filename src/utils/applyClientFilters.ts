type FilterConfig<T> = {
  [key: string]: (item: T, value: any) => boolean;
};

export const applyClientFilters = <T>(
  data: T[],
  filterValues: Record<string, any>,
  config: FilterConfig<T>
): T[] => {
  return data.filter(item =>
    Object.entries(filterValues).every(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return true;
      }

      const handler = config[key];
      if (!handler) return true;

      return handler(item, value);
    })
  );
};
