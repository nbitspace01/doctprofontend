import type { Dayjs } from "dayjs";
import { roleProps } from "../../App";

/* ================================
   Core Entity (API / DB)
================================ */

export interface AdsPostData {
  key: string;
  sNo: number;
  id: string;
  title: string;
  companyName: string;
  hospitalName: string;
  adType: string;
  displayLocation: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  description: string;
  status: string;
  imageUrl?: string;
  country?: string;
  state?: string;
  redirectUrl?: string;
  contentType?: string;
  createdByName?: string;
}

/* ================================
   List / Table Response
================================ */

export interface AdsPostResponse {
  data: AdsPostData[];
  total: number;
}

/* ================================
   Form Values (UI Layer)
   Used ONLY inside AntD Form
================================ */

export interface AdsPostFormValues {
  title: string;
  companyName: string;
  adType: string;
  country: string;
  state: string;
  contentType: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  redirectUrl: string;
  description: string;
  displayLocation?: string;
  status?: string;
}

/* ================================
   API Payload (Create / Update)
   What backend expects
================================ */

export interface AdsPostPayload {
  title: string;
  companyName: string;
  adType: string;
  country: string;
  state: string;
  contentType: string;
  imageUrl: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  redirectUrl: string;
  description: string;
  displayLocation?: string;
  status?: string;
}

/* ================================
   Component Props
================================ */

export interface CreateAdPostProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: AdsPostData | null;
}

export interface AdsPostViewDrawerProps {
  open: boolean;
  onClose: () => void;
  adsData: AdsPostData; // pass the ad ID
  role: roleProps | string,
}