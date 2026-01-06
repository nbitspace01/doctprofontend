import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Drawer, Image, Skeleton } from "antd";
import axios from "axios";
import FormattedDate from "../../Common/FormattedDate";

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

interface HealthCareProfessional {
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

interface HealthCareViewProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string | null;
}

const HealthCareView: React.FC<HealthCareViewProps> = ({
  isOpen,
  onClose,
  professionalId,
}) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const { data, isLoading, error } = useQuery({
    queryKey: ["healthcareProfessional", professionalId],
    queryFn: async () => {
      if (!professionalId) {
        throw new Error("Professional ID is required");
      }
      console.log("Fetching professional with ID:", professionalId);
      
      // Try POST with byId endpoint first (common pattern in this codebase)
      try {
        const response = await axios.post<HealthCareProfessional>(
          `${API_URL}/api/professinal/byId`,
          { id: professionalId }
        );
        console.log("POST API Response:", response.data);
        return response.data;
      } catch (postError: any) {
        // If POST fails, try GET
        console.log("POST failed, trying GET:", postError);
        try {
          const response = await axios.get<HealthCareProfessional>(
            `${API_URL}/api/professinal/${professionalId}`
          );
          console.log("GET API Response:", response.data);
          return response.data;
        } catch (getError: any) {
          console.error("Both POST and GET failed:", getError);
          throw new Error(
            postError.response?.data?.message || 
            getError?.response?.data?.message ||
            (getError instanceof Error ? getError.message : String(getError)) || 
            "Failed to fetch professional data"
          );
        }
      }
    },
    enabled: !!professionalId && isOpen,
    retry: 1,
  });

  // Helper function to get full name
  const getFullName = () => {
    if (!data) return "N/A";
    if (data.firstName && data.lastName) {
      return `${data.firstName} ${data.lastName}`;
    }
    if (data.firstName) {
      return data.firstName;
    }
    if (data.lastName) {
      return data.lastName;
    }
    return "N/A";
  };

  // Helper function to get avatar initial
  const getAvatarInitial = () => {
    if (!data) return "N";
    const fullName = getFullName();
    if (fullName !== "N/A") {
      return fullName.charAt(0).toUpperCase();
    }
    if (data.email) {
      return data.email.charAt(0).toUpperCase();
    }
    return "N";
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={500}
      title="Healthcare Professional"
    >
      {isLoading ? (
        <div className="py-8">
          <Skeleton active />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          <p className="font-medium">Error loading professional data</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Professional ID: {professionalId || "Not provided"}
          </p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            {data.profilePicture ? (
              <Image
                src={data.profilePicture}
                width={48}
                height={48}
                alt={getFullName()}
                className="rounded-full object-cover"
              />
            ) : (
              <Avatar
                size={48}
                className="bg-button-primary text-white"
              >
                {getAvatarInitial()}
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold">{getFullName()}</h2>
              <p className="text-gray-600">{data.email || "N/A"}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{data.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium">{data.role || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">DOB</p>
              <p className="font-medium">
                {data.dob ? (
                  <FormattedDate dateString={data.dob} format="long" />
                ) : (
                  "N/A"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{data.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{data.city || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{data.state || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{data.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Degree</p>
              <p className="font-medium">{data.degree || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="font-medium">{data.specialization || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Year</p>
              <p className="font-medium">{data.startYear || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Year</p>
              <p className="font-medium">{data.endYear || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Month</p>
              <p className="font-medium">{data.startMonth || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Year Exp</p>
              <p className="font-medium">{data.startYearExp || "N/A"}</p>
            </div>
            {data.college && (
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="font-medium">{data.college.name || "N/A"}</p>
              </div>
            )}
            {data.hospital && (
              <div>
                <p className="text-sm text-gray-500">Hospital</p>
                <p className="font-medium">{data.hospital.name || "N/A"}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                {data.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">
                {data.created_at ? (
                  <FormattedDate dateString={data.created_at} format="long" />
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available</div>
      )}
    </Drawer>
  );
};

export default HealthCareView;
