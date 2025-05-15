export interface ApiHospitalData {
  id: string;
  name: string;
  branchLocation: string;
  logoUrl: string | null;
  isActive: boolean;
  isHeadBranch: boolean;
  created_at: string;
  updated_at: string;
}
