import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Tag } from "antd";
import axios from "axios";
import { useMemo } from "react";
import {
  updateStudentApi,
  updateStudentStatusApi,
} from "../../../api/student.api";
import StatusBadge from "../../Common/StatusBadge";
import FormattedDate from "../../Common/FormattedDate";

interface StudentData {
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  /** The list API returns the resolved college as `college`. */
  college?: string | null;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  isFresher?: boolean;
  currentlyWorking?: boolean;
  experienceOrganizationName?: string | null;
  experienceRole?: string | null;
  experience_role?: string | null;
  role?: string | null;
  experienceSpecialization?: string | null;
  experienceLocation?: string | null;
  experienceStartDate?: string | null;
  experienceEndDate?: string | null;
  kycStatus: string;
  status: string;
  /** 'MEDICAL' | 'NONMEDICAL' as returned by the list API. */
  category?: string;
}

interface StudentViewProps {
  open: boolean;
  onClose: () => void;
  studentData: StudentData;
  /**
   * Which registrant group this record belongs to. Non-medical users register
   * through the student flow but have no college, study years, experience
   * details or KYC, so those fields are hidden for them.
   */
  category?: "MEDICAL" | "NONMEDICAL";
}

type StudentStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const StudentView: React.FC<StudentViewProps> = ({
  open,
  onClose,
  studentData,
  category = "MEDICAL",
}) => {
  const isNonMedical =
    (studentData.category ?? category)?.toUpperCase() === "NONMEDICAL";
  const entityLabel = isNonMedical ? "User" : "Student";

  /**
   * Non-medical signup only collects a handful of fields, so anything they were
   * never asked for is hidden rather than shown as "NA" (InfoField skips empty
   * values). Students keep the existing placeholder.
   */
  const orPlaceholder = (value?: string | number | null) =>
    value || (isNonMedical ? null : "NA");
  const { modal, message } = App.useApp();
  const queryClient = useQueryClient();

  /* -------------------- Derived Values -------------------- */
  const displayName = useMemo(() => {
    if (studentData.studentName) return studentData.studentName;

    const fullName = `${studentData.studentName}`.trim();

    return fullName || "N/A";
  }, [studentData]);

  const avatarInitial = useMemo(() => {
    if (studentData.studentName)
      return studentData.studentName[0].toUpperCase();
    if (studentData.studentName)
      return studentData.studentName[0].toUpperCase();
    return studentData.email?.[0]?.toUpperCase() || "A";
  }, [studentData]);

  // const profileImage = studentData.profile_image || studentData.image_url || "";

  /* -------------------- Update Status -------------------- */
  const { mutate: updateStatus, isPending: isPendingMutation } = useMutation({
    mutationFn: ({
      studentId,
      status,
    }: {
      studentId: string;
      status: StudentStatus;
    }) => updateStudentStatusApi(studentId, { status }),

    onSuccess: () => {
      message.success(`${entityLabel} status updated`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onClose();
    },

    onError: () => {
      message.error(`Failed to update ${entityLabel.toLowerCase()} status`);
    },
  });

  /* -------------------- Handlers -------------------- */
  // const status = studentData.status;

  const status = studentData.status;

  const isPending = status === "PENDING";
  const isActive = status === "ACTIVE";
  const isInactive = status === "INACTIVE";

  const getNextStatus = (): StudentStatus =>
    status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "ACTIVE"
          ? `Activate ${entityLabel}?`
          : `Deactivate ${entityLabel}?`,
      content: `Are you sure you want to ${nextStatus} "${studentData.studentName}"?`,
      okType: nextStatus === "ACTIVE" ? "primary" : "danger",
      onOk: () =>
        updateStatus({
          studentId: studentData.studentId,
          status: nextStatus,
        }),
    });
  };

  return (
    <Drawer
      title={isNonMedical ? "Non-Medical Users" : "Students"}
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
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
            {isActive ? "Deactivate" : "Activate"} {entityLabel}
          </Button>
        </div>
      }
    >
      {studentData && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-100" />
            <Avatar className="text-white bg-button-primary ">
              {studentData.studentName?.[0] || "?"}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {studentData.studentName}
                </h3>
              </div>
              <p className="text-gray-500">
                {entityLabel} ID: #{studentData.studentId.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Gender" value={orPlaceholder(studentData.gender)} />
            <InfoField
              label="DOB"
              value={
                studentData.dob ? (
                  <FormattedDate dateString={studentData.dob} format="long" />
                ) : (
                  orPlaceholder(null)
                )
              }
            />
            <InfoField label="Email Address" value={studentData.email} />
            <InfoField label="Phone Number" value={studentData.phone} />
            {!isNonMedical && (
              <InfoField
                label="College/University"
                value={studentData.college || "NA"}
              />
            )}
            <InfoField
              label={isNonMedical ? "Education" : "Degree"}
              value={orPlaceholder(studentData.degree)}
            />
            <InfoField
              label="Specializations"
              value={orPlaceholder(studentData.specialization)}
            />
            <InfoField
              label="Location"
              value={orPlaceholder(studentData.address)}
            />
            {/* Non-medical users only supply education + an employment status;
                study years, experience details and KYC never apply to them. */}
            {isNonMedical ? (
              <InfoField
                label="Employment"
                value={
                  studentData.isFresher === null ||
                  studentData.isFresher === undefined
                    ? null
                    : studentData.isFresher
                      ? "Fresher"
                      : "Experienced"
                }
              />
            ) : (
              <>
                <InfoField
                  label="Start Year"
                  value={studentData.startYear || "NA"}
                />
                <InfoField
                  label="End Year"
                  value={studentData.endYear || "NA"}
                />
                <InfoField
                  label="Experience Type"
                  value={
                    studentData.isFresher === null ||
                    studentData.isFresher === undefined
                      ? "NA"
                      : studentData.isFresher
                        ? "Fresher"
                        : "Experienced"
                  }
                />
                <InfoField
                  label="Working Status"
                  value={
                    studentData.currentlyWorking
                      ? "Currently Working"
                      : "Not Working"
                  }
                />
                <InfoField
                  label="Experience Organization"
                  value={studentData.experienceOrganizationName || "NA"}
                />
                <InfoField
                  label="Experience Role"
                  value={
                    studentData.experienceRole ||
                    studentData.experience_role ||
                    "NA"
                  }
                />
                <InfoField
                  label="Experience Specialization"
                  value={studentData.experienceSpecialization || "NA"}
                />
                <InfoField
                  label="Experience Location"
                  value={studentData.experienceLocation || "NA"}
                />
                <InfoField
                  label="Experience Start Date"
                  value={studentData.experienceStartDate || "NA"}
                />
                <InfoField
                  label="Experience End Date"
                  value={
                    studentData.currentlyWorking
                      ? "Present"
                      : studentData.experienceEndDate || "NA"
                  }
                />
                <InfoField
                  label="KYC Status"
                  value={<StatusBadge status={studentData.kycStatus || "NA"} />}
                />
              </>
            )}
            <InfoField
              label="Status"
              value={<StatusBadge status={studentData.status} />}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

const InfoField: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => {
  // A label with nothing under it reads as broken, so empty fields are dropped
  // entirely. Callers that want a placeholder pass one explicitly.
  if (value === null || value === undefined || value === "") return null;

  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
};

export default StudentView;
