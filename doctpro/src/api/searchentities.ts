import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

// Types for different search entities
export interface SearchEntity {
  id: string;
  type:
    | "user"
    | "hospital"
    | "college"
    | "student"
    | "kyc"
    | "ads"
    | "campaign";
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchResponse {
  data: SearchEntity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  keyword: string;
  types?: string[];
  page?: number;
  limit?: number;
  filters?: {
    status?: string;
    location?: string;
    userType?: string;
  };
}

// Main search function that searches across multiple entities
export const searchEntities = async (
  params: SearchParams
): Promise<SearchResponse> => {
  try {
    const response = await axios.post(
      `${URL}/api/dashboard/searchEntities`,
      params // send as JSON body
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to search entities"
      );
    }
    throw error;
  }
};

// Individual entity search functions for specific searches
export const searchUsers = async (
  keyword: string,
  page: number = 1,
  limit: number = 10,
  userType?: string
) => {
  try {
    const queryParams = new URLSearchParams({
      keyword,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (userType) {
      queryParams.append("userType", userType);
    }

    const response = await axios.get(`${URL}/api/search/users?${queryParams}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to search users"
      );
    }
    throw error;
  }
};

export const searchHospitals = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const queryParams = new URLSearchParams({
      keyword,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axios.get(
      `${URL}/api/search/hospitals?${queryParams}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to search hospitals"
      );
    }
    throw error;
  }
};

export const searchColleges = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const queryParams = new URLSearchParams({
      keyword,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axios.get(
      `${URL}/api/search/colleges?${queryParams}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to search colleges"
      );
    }
    throw error;
  }
};

export const searchStudents = async (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const queryParams = new URLSearchParams({
      keyword,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axios.get(
      `${URL}/api/search/students?${queryParams}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to search students"
      );
    }
    throw error;
  }
};

// TanStack Query hooks for search functionality
export const useSearchEntities = (params: SearchParams) => {
  return useQuery({
    queryKey: ["search-entities", params],
    queryFn: () => searchEntities(params),
    enabled: !!params.keyword && params.keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSearchUsers = (
  keyword: string,
  page: number = 1,
  limit: number = 10,
  userType?: string
) => {
  return useQuery({
    queryKey: ["search-users", keyword, page, limit, userType],
    queryFn: () => searchUsers(keyword, page, limit, userType),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSearchHospitals = (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["search-hospitals", keyword, page, limit],
    queryFn: () => searchHospitals(keyword, page, limit),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSearchColleges = (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["search-colleges", keyword, page, limit],
    queryFn: () => searchColleges(keyword, page, limit),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSearchStudents = (
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["search-students", keyword, page, limit],
    queryFn: () => searchStudents(keyword, page, limit),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Utility function to get entity type display name
export const getEntityTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    user: "User",
    hospital: "Hospital",
    college: "College",
    student: "Student",
    kyc: "KYC",
    ads: "Advertisement",
    campaign: "Campaign",
  };
  return typeMap[type] || type;
};

// Utility function to get entity icon or avatar
export const getEntityAvatar = (entity: SearchEntity): string => {
  if (entity.avatar) {
    return entity.avatar;
  }

  // Return initials based on name
  const initials = entity.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=40`;
};
