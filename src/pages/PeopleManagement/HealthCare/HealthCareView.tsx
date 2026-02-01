import { App, Avatar, Button, Drawer, Image, Skeleton } from "antd";
import FormattedDate from "../../Common/FormattedDate";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHealthcareProfessionalApi } from "../../../api/healthcare.api";

interface CollegeData {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  country: string | null;
}

interface HospitalData {
  id: string;
  name: string;
  branchLocation: string;
  city: string | null;
  state: string;
  country: string | null;
}

interface HealthcareProfessionalData {
  id: string;
  // firstName: string | null;
  // lastName: string | null;
  name: string;
  email: string;
  phoneNumber: string;
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
  status: string;
  isActive: boolean;
  college: CollegeData | null;
  hospital: HospitalData | null;
  createdAt: string;
}

interface HealthCareViewProps {
  open: boolean;
  onClose: () => void;
  professionalData: HealthcareProfessionalData;
}

type HealthcareStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const HealthCareView: React.FC<HealthCareViewProps> = ({
  open,
  onClose,
  professionalData,
}) => {
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (professionalData.name) return professionalData.name;

    const fullName = `${professionalData.name || ""}`.trim();

    return fullName || "N/A";
  }, [professionalData]);

  const avatarInitial = useMemo(() => {
    if (professionalData.name) return professionalData.name[0].toUpperCase();
    if (professionalData.name) return professionalData.name[0].toUpperCase();
  }, [professionalData]);

  // Helper function to get full name
  const getFullName = () => {
    if (!professionalData) return "N/A";
    if (professionalData.name) {
      return `${professionalData.name}`;
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

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      professionalId,
      status,
    }: {
      professionalId: string;
      status: HealthcareStatus;
    }) => updateHealthcareProfessionalApi(professionalId, { status }),

    onSuccess: () => {
      message.success("Healcare professional status updated");
      queryClient.invalidateQueries({ queryKey: ["healthcareProfessionals"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update healthcare professional status");
    },
  });

  /* -------------------- Handlers -------------------- */
  const status = professionalData.status;

  const isPending = status === "PENDING";
  const isActive = status === "ACTIVE";
  const isInactive = status === "INACTIVE";

  const getNextStatus = (): HealthcareStatus => {
    if (status === "PENDING") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE" ? "Activate Degree?" : "Deactivate Degree?",
      content: `Are you sure you want to ${nextStatus} "${professionalData.name}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          professionalId: professionalData.id,
          status: nextStatus,
        }),
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={500}
      className="custom-drawer"
      title="Healthcare Professional"
      footer={
        <div className="flex justify-between items-center">
          <Button
            size="large"
            className="bg-gray-200 text-gray-700 px-8"
            onClick={onClose}
          >
            Back
          </Button>

          <Button
            size="large"
            loading={isPendingMutation}
            disabled={isPendingMutation}
            className={`px-8 ${
              isActive
                ? "border-red-500 text-red-500"
                : "border-green-500 text-green-500"
            }`}
            onClick={handleStatusToggle}
          >
            {isActive ? "Deactivate" : "Activate"} Healthcare Professional
          </Button>
        </div>
      }
    >
      {professionalData ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            {professionalData.profilePicture ? (
              <Image
                src={professionalData.profilePicture}
                width={48}
                height={48}
                alt={getFullName()}
                className="rounded-full object-cover"
              />
            ) : (
              <Avatar size={48} className="bg-button-primary text-white">
                {getAvatarInitial()}
              </Avatar>
            )}

            <div>
              <h2 className="text-lg font-semibold">{getFullName()}</h2>
              <p className="text-sm text-gray-500">
                {professionalData.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone Number</p>
              <p className="text-sm font-medium">
                {professionalData.phoneNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Role</p>
              <p className="text-sm font-medium">
                {professionalData.role || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">DOB</p>
              <p className="text-sm font-medium">
                {professionalData.dob ? (
                  <FormattedDate
                    dateString={professionalData.dob}
                    format="long"
                  />
                ) : (
                  "N/A"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Gender</p>
              <p className="text-sm font-medium">
                {professionalData.gender || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">City</p>
              <p className="text-sm font-medium">
                {professionalData.city || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">State</p>
              <p className="text-sm font-medium">
                {professionalData.state || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <p className="text-sm font-medium">
                {professionalData.country || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Degree</p>
              <p className="text-sm font-medium">
                {professionalData.degree || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Specialization</p>
              <p className="text-sm font-medium">
                {professionalData.specialization || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Start Year</p>
              <p className="text-sm font-medium">
                {professionalData.startYear || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">End Year</p>
              <p className="text-sm font-medium">
                {professionalData.endYear || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Start Month</p>
              <p className="text-sm font-medium">
                {professionalData.startMonth || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Experience Start Year
              </p>
              <p className="text-sm font-medium">
                {professionalData.startYearExp || "N/A"}
              </p>
            </div>

            {professionalData.college && (
              <div>
                <p className="text-xs text-gray-500 mb-1">College</p>
                <p className="text-sm font-medium">
                  {professionalData.college.name || "N/A"}
                </p>
              </div>
            )}

            {professionalData.hospital && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Hospital</p>
                <p className="text-sm font-medium">
                  {professionalData.hospital.name || "N/A"}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-sm font-medium">
                {professionalData.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Created At</p>
              <p className="text-sm font-medium">
                {professionalData.createdAt ? (
                  <FormattedDate
                    dateString={professionalData.createdAt}
                    format="long"
                  />
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No professional data available
        </div>
      )}
    </Drawer>
  );
};

export default HealthCareView;
