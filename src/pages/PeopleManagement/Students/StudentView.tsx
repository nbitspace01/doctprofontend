import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Tag } from "antd";
import axios from "axios";
import { useMemo } from "react";
import {
  updateStudentApi,
  updateStudentStatusApi,
} from "../../../api/student.api";
import StatusBadge from "../../Common/StatusBadge";

interface StudentData {
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  collegeName: string;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  kycStatus: string;
  status: string;
}

interface StudentViewProps {
  open: boolean;
  onClose: () => void;
  studentData: StudentData;
}

type StudentStatus = "PENDING" | "ACTIVE" | "INACTIVE";

const StudentView: React.FC<StudentViewProps> = ({
  open,
  onClose,
  studentData,
}) => {
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
      message.success("Student status updated");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onClose();
    },

    onError: () => {
      message.error("Failed to update student status");
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
        nextStatus === "ACTIVE" ? "Activate Student?" : "Deactivate Student?",
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
      title="Students"
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
            {isActive ? "Deactivate" : "Activate"} Student
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
                Student ID: #{studentData.studentId.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Gender" value={studentData.gender} />
            <InfoField
              label="DOB"
              value={new Date(studentData.dob).toLocaleDateString()}
            />
            <InfoField label="Email Address" value={studentData.email} />
            <InfoField label="Phone Number" value={studentData.phone} />
            <InfoField
              label="College/University"
              value={studentData.collegeName || "NA"}
            />
            <InfoField label="Degree" value={studentData.degree || "NA"} />
            <InfoField
              label="Specializations"
              value={studentData.specialization || "NA"}
            />
            <InfoField label="Location" value={studentData.address || "NA"} />
            <InfoField
              label="Start Year"
              value={studentData.startYear || "NA"}
            />
            <InfoField label="End Year" value={studentData.endYear || "NA"} />
            <InfoField
              label="KYC Status"
              value={<StatusBadge status={studentData.kycStatus || "NA"} />}
            />
            <InfoField
              label="KYC Status"
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
}> = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default StudentView;
