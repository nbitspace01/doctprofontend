import { roleProps, UserRole } from "../../App";

/* -------------------- Core Job Post -------------------- */
export interface JobPostBase {
  id: string;
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  status: string;
  noOfApplications?: number;
  valid_from?: string;
  expires_at?: string;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
  applications?: JobApplication[]; 
}

/* -------------------- Job List -------------------- */
export interface JobPostResponse {
  data: JobPostBase[];
  total: number;
}

/* -------------------- Applicants -------------------- */
export interface Applicant {
  id: string;
  coverLetter: string;
  applied_at: string;
  resumeUrl: string;
  status: string;
}

/* -------------------- Applicant User -------------------- */
export interface ApplicantUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface JobApplication {
  id: string;
  resumeUrl: string;
  coverLetter: string;
  applied_at: string;
  status: "PENDING" | "SHORTLISTED" | "REJECTED";
  user: ApplicantUser;
}


/* -------------------- View Drawer -------------------- */
export interface JobPostViewDrawerProps {
  open: boolean;
  onClose: () => void;
  jobPostData: JobPostBase;
  role: UserRole;
}

/* -------------------- Create / Edit -------------------- */
export interface CreateJobPostProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: JobPostFormValues) => void;
  initialData?: JobPostBase | null;
}

/* -------------------- Form Values -------------------- */
export interface JobPostFormValues {
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  valid_from?: Date;
  expires_at?: Date;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
}

export interface ApplicantViewDrawerProps {
  open: boolean;
  onClose: () => void;
  applicant: JobApplication | null;
}
