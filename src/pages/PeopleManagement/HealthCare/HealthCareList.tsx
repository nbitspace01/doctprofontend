import { useQuery } from "@tanstack/react-query";
import { Avatar, Button } from "antd";
import axios from "axios";
import React, { useState } from "react";
import HealthCareView from "./HealthCareView";
import DownloadFilterButton from "../../Common/DownloadFilterButton";
import CommonDropdown from "../../Common/CommonActionsDropdown";
import CommonPagination from "../../Common/CommonPagination";
import FormattedDate from "../../Common/FormattedDate";
import Loader from "../../Common/Loader";

interface College {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string | null;
}

interface Hospital {
  id: string;
  name: string;
  branchLocation: string;
  city: string | null;
  state: string;
  country: string | null;
}

interface HealthcareProfessional {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  dob: string | null;
  gender: string | null;
  city: string;
  state: string;
  country: string;
  profilePicture: string | null;
  degree: string;
  specialization: string;
  startYear: string | null;
  endYear: string | null;
  role: string;
  startMonth: string | null;
  startYearExp: string | null;
  endMonth: string | null;
  endYearExp: string | null;
  currentlyWorking: boolean;
  college: College | null;
  hospital: Hospital | null;
  isActive: boolean;
  created_at: string;
}

interface HealthcareProfessionalsResponse {
  total: number;
  page: number;
  limit: number;
  data: HealthcareProfessional[];
}

const HealthCareList: React.FC = () => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  const filterOptions = [
    {
      label: "Name",
      key: "name",
      type: "text" as const,
    },
    {
      label: "Email",
      key: "email",
      type: "text" as const,
    },
    {
      label: "Phone",
      key: "phone",
      type: "text" as const,
    },
    {
      label: "Role",
      key: "role",
      type: "text" as const,
    },
    {
      label: "City",
      key: "city",
      type: "text" as const,
    },
    {
      label: "State",
      key: "state",
      type: "text" as const,
    },
    {
      label: "Country",
      key: "country",
      type: "text" as const,
    },
    {
      label: "Degree",
      key: "degree",
      type: "text" as const,
    },
    {
      label: "Specialization",
      key: "specialization",
      type: "text" as const,
    },
    {
      label: "Gender",
      key: "gender",
      type: "checkbox" as const,
      options: ["Male", "Female", "Other"],
    },
    {
      label: "Status",
      key: "status",
      type: "checkbox" as const,
      options: ["Active", "Inactive"],
    },
    {
      label: "Start Year",
      key: "startYear",
      type: "text" as const,
    },
    {
      label: "End Year",
      key: "endYear",
      type: "text" as const,
    },
  ];

  const {
    data: healthcareData,
    isFetching,
    error,
    refetch,
  } = useQuery<HealthcareProfessionalsResponse | HealthcareProfessional[]>({
    queryKey: ["healthcareProfessionals", currentPage, pageSize, searchValue, filterValues],
    queryFn: async () => {
      const searchParam = searchValue ? `&search=${encodeURIComponent(searchValue)}` : "";
      console.log(`Fetching page ${currentPage} with limit ${pageSize}, search: ${searchValue}`);
      const response = await axios.get(
        `${API_URL}/api/professinal?page=${currentPage}&limit=${pageSize}${searchParam}`
      );
      console.log("API Response:", response.data);
      console.log("API Response Type:", Array.isArray(response.data) ? "Array" : "Object");
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Helper function to get full name
  const getFullName = (professional: HealthcareProfessional) => {
    if (professional.firstName && professional.lastName) {
      return `${professional.firstName} ${professional.lastName}`;
    }
    if (professional.firstName) {
      return professional.firstName;
    }
    if (professional.lastName) {
      return professional.lastName;
    }
    return "N/A";
  };

  // Handle both response structures: array directly or wrapped in object
  let professionals: HealthcareProfessional[] = Array.isArray(healthcareData)
    ? healthcareData
    : (healthcareData?.data || []);
  
  // Apply client-side filtering
  const nameFilter = filterValues.name;
  const emailFilter = filterValues.email;
  const phoneFilter = filterValues.phone;
  const roleFilter = filterValues.role;
  const cityFilter = filterValues.city;
  const stateFilter = filterValues.state;
  const countryFilter = filterValues.country;
  const degreeFilter = filterValues.degree;
  const specializationFilter = filterValues.specialization;
  const startYearFilter = filterValues.startYear;
  const endYearFilter = filterValues.endYear;
  
  const genderFilters: string[] = [];
  const statusFilters: string[] = [];
  
  Object.entries(filterValues).forEach(([key, value]) => {
    if (key.startsWith("gender_") && value === true) {
      const genderValue = key.replace("gender_", "");
      if (genderValue) {
        genderFilters.push(genderValue);
      }
    }
    if (key.startsWith("status_") && value === true) {
      const statusValue = key.replace("status_", "");
      if (statusValue) {
        statusFilters.push(statusValue);
      }
    }
  });

  // Apply search value as a general search across name, email, phone
  if (searchValue) {
    const searchLower = searchValue.toLowerCase().trim();
    professionals = professionals.filter((professional) => {
      const fullName = getFullName(professional).toLowerCase();
      const email = professional.email?.toLowerCase() || "";
      const phone = professional.phone?.toLowerCase() || "";
      return fullName.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });
  }

  // Apply filters
  const hasFilters = nameFilter || emailFilter || phoneFilter || roleFilter || 
                     cityFilter || stateFilter || countryFilter || 
                     degreeFilter || specializationFilter || 
                     genderFilters.length > 0 || statusFilters.length > 0 || 
                     startYearFilter || endYearFilter;

  if (hasFilters) {
    professionals = professionals.filter((professional) => {
      const fullName = getFullName(professional).toLowerCase();
      const matchesName = !nameFilter || 
        fullName.includes(String(nameFilter).toLowerCase().trim());
      
      const matchesEmail = !emailFilter || 
        professional.email?.toLowerCase().includes(String(emailFilter).toLowerCase().trim());
      
      const matchesPhone = !phoneFilter || 
        professional.phone?.toLowerCase().includes(String(phoneFilter).toLowerCase().trim());
      
      const matchesRole = !roleFilter || 
        professional.role?.toLowerCase().includes(String(roleFilter).toLowerCase().trim());
      
      const matchesCity = !cityFilter || 
        professional.city?.toLowerCase().includes(String(cityFilter).toLowerCase().trim());
      
      const matchesState = !stateFilter || 
        professional.state?.toLowerCase().includes(String(stateFilter).toLowerCase().trim());
      
      const matchesCountry = !countryFilter || 
        professional.country?.toLowerCase().includes(String(countryFilter).toLowerCase().trim());
      
      const matchesDegree = !degreeFilter || 
        professional.degree?.toLowerCase().includes(String(degreeFilter).toLowerCase().trim());
      
      const matchesSpecialization = !specializationFilter || 
        professional.specialization?.toLowerCase().includes(String(specializationFilter).toLowerCase().trim());
      
      const matchesGender = genderFilters.length === 0 || (() => {
        const professionalGender = professional.gender || "";
        return genderFilters.some(genderFilter => 
          professionalGender.toLowerCase() === genderFilter.toLowerCase()
        );
      })();
      
      const matchesStatus = statusFilters.length === 0 || (() => {
        const professionalStatus = professional.isActive ? "Active" : "Inactive";
        return statusFilters.some(statusFilter => 
          professionalStatus.toLowerCase() === statusFilter.toLowerCase()
        );
      })();
      
      const matchesStartYear = !startYearFilter || (() => {
        if (!professional.startYear) return false;
        const filterYear = String(startYearFilter).trim();
        const professionalYear = String(professional.startYear).trim();
        return professionalYear.includes(filterYear) || filterYear === professionalYear;
      })();
      
      const matchesEndYear = !endYearFilter || (() => {
        if (!professional.endYear) return false;
        const filterYear = String(endYearFilter).trim();
        const professionalYear = String(professional.endYear).trim();
        return professionalYear.includes(filterYear) || filterYear === professionalYear;
      })();
      
      return matchesName && matchesEmail && matchesPhone && matchesRole && 
             matchesCity && matchesState && matchesCountry && 
             matchesDegree && matchesSpecialization && 
             matchesGender && matchesStatus && matchesStartYear && matchesEndYear;
    });
  }
  
  const total = Array.isArray(healthcareData)
    ? healthcareData.length
    : (healthcareData?.total || 0);
  
  // Use filtered count if client-side filtering or search is applied
  const hasClientSideFilters = searchValue || hasFilters;
  const displayTotal = hasClientSideFilters ? professionals.length : total;
  
  // Paginate filtered results only if client-side filtering is applied
  // Otherwise, use server-side paginated results
  const paginatedProfessionals = hasClientSideFilters
    ? professionals.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : professionals;
  
  console.log("Processed professionals:", professionals);
  console.log("Total:", total);
  console.log("Display Total:", displayTotal);

  console.log("Current state:", {
    currentPage,
    pageSize,
    total,
    professionalsCount: professionals.length,
    isFetching,
  });

  const getStatusColor = (isActive: boolean) => {
    if (isActive) {
      return "bg-green-100 text-green-600";
    }
    return "bg-red-100 text-red-600";
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePageChange = (page: number, size?: number) => {
    console.log(`Changing to page ${page}, size: ${size}`);
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filter values:", filters);
    setFilterValues(filters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDownload = (format: "excel" | "csv") => {
    if (!professionals || professionals.length === 0) {
      console.log("No data to download");
      return;
    }

    const headers = [
      "S No",
      "Name",
      "Email",
      "Phone",
      "DOB",
      "Gender",
      "City",
      "State",
      "Country",
      "Degree",
      "Specialization",
      "Start Year",
      "End Year",
      "Role",
      "Start Month",
      "Start Year Exp",
      "Status",
    ];

    const rows = [];
    rows.push(headers.join(format === "csv" ? "," : "\t"));

    professionals.forEach((professional, index) => {
      const fullName = getFullName(professional);
      const values = [
        (currentPage - 1) * pageSize + index + 1,
        `"${fullName}"`,
        `"${professional.email || "N/A"}"`,
        `"${professional.phone || "N/A"}"`,
        `"${professional.dob || "N/A"}"`,
        `"${professional.gender || "N/A"}"`,
        `"${professional.city || "N/A"}"`,
        `"${professional.state || "N/A"}"`,
        `"${professional.country || "N/A"}"`,
        `"${professional.degree || "N/A"}"`,
        `"${professional.specialization || "N/A"}"`,
        `"${professional.startYear || "N/A"}"`,
        `"${professional.endYear || "N/A"}"`,
        `"${professional.role || "N/A"}"`,
        `"${professional.startMonth || "N/A"}"`,
        `"${professional.startYearExp || "N/A"}"`,
        `"${professional.isActive ? "Active" : "Inactive"}"`,
      ];
      rows.push(values.join(format === "csv" ? "," : "\t"));
    });

    const content = rows.join("\n");
    const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
    const fileExtension = format === "csv" ? "csv" : "xls";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthcare-professionals-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-center">
          Error loading data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
          <Button onClick={() => refetch()} className="ml-4" type="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Healthcare professionals</h1>

      <div className="bg-white rounded-lg shadow w-full">
        <DownloadFilterButton
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onDownload={handleDownload}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                S No
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                DOB
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                City
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                State
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Country
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Degree
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Specialization
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Start Year
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                End Year
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Start Month
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Start Year Exp
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProfessionals.length === 0 ? (
              <tr>
                <td colSpan={17} className="px-6 py-4 text-center text-gray-500">
                  {isFetching ? (
                    <Loader size="large" />
                  ) : (
                    "No healthcare professionals found"
                  )}
                </td>
              </tr>
            ) : (
              paginatedProfessionals.map((professional, index) => {
                const fullName = getFullName(professional);
                const avatarInitial = fullName !== "N/A" ? fullName.charAt(0).toUpperCase() : professional.email?.charAt(0).toUpperCase() || "N";
                
                return (
                  <tr key={professional.id}>
                    <td className="px-6 py-4 text-sm">
                      {hasClientSideFilters
                        ? (currentPage - 1) * pageSize + index + 1
                        : (currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {professional.profilePicture ? (
                          <img
                            src={professional.profilePicture}
                            alt={fullName}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                        ) : (
                          <Avatar className="bg-button-primary w-8 h-8 rounded-full mr-2 text-white">
                            {avatarInitial}
                          </Avatar>
                        )}
                        <span className="text-sm">
                          {fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.dob ? (
                        <FormattedDate
                          dateString={professional.dob}
                          format="long"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.gender || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.city || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.state || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.country || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.degree || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.specialization || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.startYear || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.endYear || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.role || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.startMonth || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {professional.startYearExp || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                          professional.isActive
                        )}`}
                      >
                        {professional.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <CommonDropdown
                        onView={() => {
                          setSelectedProfessionalId(professional.id);
                          setIsDrawerOpen(true);
                        }}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        showEdit={false}
                        showDelete={false}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>

        {displayTotal > 0 && (
          <CommonPagination
            current={currentPage}
            pageSize={pageSize}
            total={displayTotal}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        )}
      </div>

      <HealthCareView
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        professionalId={selectedProfessionalId}
      />
    </div>
  );
};

export default HealthCareList;
