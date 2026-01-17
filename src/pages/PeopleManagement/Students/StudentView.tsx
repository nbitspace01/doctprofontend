import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Drawer, Tag } from "antd";
import axios from "axios";
import { useMemo } from "react";
import { updateStudentApi } from "../../../api/student.api";

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
  kycStatus: boolean;
  userStatus: string;
}

interface StudentViewProps {
  open: boolean;
  onClose: () => void;
  studentData: StudentData;
}

type StudentStatus = "pending" | "active" | "inactive";

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
    }) => updateStudentApi(studentId, { status }),

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
  const status = studentData.userStatus;

  const isPending = status === "pending";
  const isActive = status === "active";
  const isInactive = status === "inactive";

  const getNextStatus = (): StudentStatus => {
    if (status === "pending") return "active";
    if (status === "active") return "inactive";
    return "active";
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus();

    modal.confirm({
      title:
        nextStatus === "active" ? "Activate Student?" : "Deactivate Student?",
      content: `Are you sure you want to ${nextStatus} "${studentData.studentName}"?`,
      okType: nextStatus === "active" ? "primary" : "danger",
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
        <div className="flex justify-between">
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
            {isActive ? "Deactivate" : "Activate"} Hospital
          </Button>
          <div className="space-x-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              className="bg-button-primary"
              disabled={studentData?.kycStatus === true}
            >
              {studentData?.kycStatus ? "Save" : "Approve"}
            </Button>
          </div>
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
                <Tag
                  color={
                    studentData.userStatus === "ACTIVE" ? "success" : "error"
                  }
                >
                  {studentData.userStatus}
                </Tag>
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
              value={
                <Tag color={studentData.kycStatus ? "success" : "error"}>
                  {studentData.kycStatus ? "Verified" : "Not Verified"}
                </Tag>
              }
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
