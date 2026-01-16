import { Avatar, Button, Drawer, Image, Skeleton } from "antd";
import FormattedDate from "../../Common/FormattedDate";
import { HealthcareProfessional } from "./HealthCareList";

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
  professionalData: HealthcareProfessional | null;
}

const HealthCareView: React.FC<HealthCareViewProps> = ({
  isOpen,
  onClose,
  professionalData,
}) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  // const { professionalData, isLoading, error } = useQuery({
  //   queryKey: ["healthcareProfessional", professionalId],
  //   queryFn: async () => {
  //     if (!professionalId) {
  //       throw new Error("Professional ID is required");
  //     }
  //     console.log("Fetching professional with ID:", professionalId);
      
  //     // Try POST with byId endpoint first (common pattern in this codebase)
  //     try {
  //       const response = await axios.post<HealthCareProfessional>(
  //         `${API_URL}/api/professinal/byId`,
  //         { id: professionalId }
  //       );
  //       console.log("POST API Response:", response.professionalData);
  //       return response.professionalData;
  //     } catch (postError: any) {
  //       // If POST fails, try GET
  //       console.log("POST failed, trying GET:", postError);
  //       try {
  //         const response = await axios.get<HealthCareProfessional>(
  //           `${API_URL}/api/professinal/${professionalId}`
  //         );
  //         console.log("GET API Response:", response.professionalData);
  //         return response.professionalData;
  //       } catch (getError: any) {
  //         console.error("Both POST and GET failed:", getError);
  //         throw new Error(
  //           postError.response?.professionalData?.message || 
  //           getError?.response?.professionalData?.message ||
  //           (getError instanceof Error ? getError.message : String(getError)) || 
  //           "Failed to fetch professional professionalData"
  //         );
  //       }
  //     }
  //   },
  //   enabled: !!professionalId && isOpen,
  //   retry: 1,
  // });

  // Helper function to get full name
  const getFullName = () => {
    if (!professionalData) return "N/A";
    if (professionalData.firstName && professionalData.lastName) {
      return `${professionalData.firstName} ${professionalData.lastName}`;
    }
    if (professionalData.firstName) {
      return professionalData.firstName;
    }
    if (professionalData.lastName) {
      return professionalData.lastName;
    }
    return "N/A";
  };

  // Helper function to get avatar initial
  const getAvatarInitial = () => {
    if (!professionalData) return "N";
    const fullName = getFullName();
    if (fullName !== "N/A") {
      return fullName.charAt(0).toUpperCase();
    }
    if (professionalData.email) {
      return professionalData.email.charAt(0).toUpperCase();
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
      {professionalData ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            {professionalData.profilePicture ? (
              <Image
                src={professionalData.profilePicture}
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
              <p className="text-gray-600">{professionalData.email || "N/A"}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{professionalData.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium">{professionalData.role || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">DOB</p>
              <p className="font-medium">
                {professionalData.dob ? (
                  <FormattedDate dateString={professionalData.dob} format="long" />
                ) : (
                  "N/A"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{professionalData.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{professionalData.city || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{professionalData.state || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{professionalData.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Degree</p>
              <p className="font-medium">{professionalData.degree || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Specialization</p>
              <p className="font-medium">{professionalData.specialization || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Year</p>
              <p className="font-medium">{professionalData.startYear || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Year</p>
              <p className="font-medium">{professionalData.endYear || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Month</p>
              <p className="font-medium">{professionalData.startMonth || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Year Exp</p>
              <p className="font-medium">{professionalData.startYearExp || "N/A"}</p>
            </div>
            {professionalData.college && (
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="font-medium">{professionalData.college.name || "N/A"}</p>
              </div>
            )}
            {professionalData.hospital && (
              <div>
                <p className="text-sm text-gray-500">Hospital</p>
                <p className="font-medium">{professionalData.hospital.name || "N/A"}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                {professionalData.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">
                {professionalData.created_at ? (
                  <FormattedDate dateString={professionalData.created_at} format="long" />
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No professionalData available</div>
      )}
    </Drawer>
  );
};

export default HealthCareView;
