import axios from "axios";

const URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

export interface CollegeRegistrationPayload {
  name: string;
  city: string;
  district: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  website_url: string;
  hospitalIds: string[];
  admin_name: string;
  admin_email: string;
  admin_person_phone: string;
}

export const registerCollege = async (payload: CollegeRegistrationPayload) => {
  try {
    const response = await axios.post(`${URL}/api/college/register`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to register college"
      );
    }
    throw error;
  }
};

export interface CollegeKycPayload {
  college_id: string;
  user_id: string;
  id_proof_type: string;
  id_proof_number: string;
  license_type: string;
  license_number: string;
  id_proof: File;
  license: File;
}

export const fetchColleges = async () => {
  try {
    const response = await axios.get(`${URL}/api/college`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to fetch colleges"
      );
    }
    throw error;
  }
};

export const fetchCollegeById = async (collegeId: string) => {
  try {
    const response = await axios.get(`${URL}/api/college/${collegeId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? "Failed to fetch college by id"
      );
    }
    throw error;
  }
};
