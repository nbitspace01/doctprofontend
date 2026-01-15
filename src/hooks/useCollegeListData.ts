import { applyClientFilters } from "../utils/applyClientFilters";

export interface CollegeTableRow {
  key: string;
  id: string;
  sNo: number;
  logo: string | null;
  collegeName: string;
  location: string;
  state: string;
  district: string;
  associatedHospital: any[];
  hospitals: any[];
  created_at: string;
  createdOn: string;
  status: "Active" | "Pending" | "Unactive";
}

export const useCollegeListData = ({
  apiData,
  filterValues,
  currentPage,
  pageSize,
}: any) => {
  const transformed: CollegeTableRow[] =
    apiData?.data?.map((college: any, index: number) => ({
      key: college.id,
      id: college.id,
      sNo: (currentPage - 1) * pageSize + index + 1,

      logo: college.logo ?? null,
      collegeName: college.name ?? "N/A",
      location: college.city ?? "N/A",

      state: college.state ?? "",
      district: college.district ?? "",

      associatedHospital: college.associatedHospital ?? [],
      hospitals: college.hospitals ?? [],

      created_at: college.created_at,
      createdOn: new Date(college.created_at).toLocaleDateString("en-GB"),

      status: college.status ?? "Pending",
    })) ?? [];

  const filtered = applyClientFilters(transformed, filterValues, {
    name: (item, value: string) =>
      item.collegeName.toLowerCase().includes(value.toLowerCase()),

    state: (item, value: string) =>
      item.state.toLowerCase().includes(value.toLowerCase()),

    district: (item, value: string) =>
      item.district.toLowerCase().includes(value.toLowerCase()),

    associatedHospital: (item, value: string) =>
      item.hospitals.some((h: any) =>
        h?.name?.toLowerCase().includes(value.toLowerCase())
      ),

    createdOn: (item, value: string) => {
      const d1 = new Date(item.created_at);
      const d2 = new Date(value);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      return d1.getTime() === d2.getTime();
    },

    status: (item, statuses: string[]) => statuses.includes(item.status),
  });

  return {
    tableData: filtered,
  };
};
