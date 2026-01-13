import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Drawer, Tag } from "antd";
import axios from "axios";

interface StudentDetails {
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  college: string;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  kycStatus: boolean;
  userStatus: string;
  is_active: boolean;
}

interface StudentViewProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const fetchStudentDetails = async (studentId: string) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;
  const response = await axios.get<StudentDetails>(
    `${API_URL}/api/student/${studentId}`
  );
  return response.data;
};

const StudentView: React.FC<StudentViewProps> = ({
  studentId,
  isOpen,
  onClose,
}) => {
  const { data: student, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => fetchStudentDetails(studentId),
    enabled: !!studentId,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Drawer
      title="Students"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
      footer={
        <div className="flex justify-between">
          <Button type="default" color="blue" variant="outlined">
            Un Activate Account
          </Button>
          <div className="space-x-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              className="bg-button-primary"
              disabled={student?.kycStatus === true}
            >
              {student?.kycStatus ? "Save" : "Approve"}
            </Button>
          </div>
        </div>
      }
    >
      {student && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-100" />
            <Avatar className="text-white bg-button-primary ">
              {student.studentName?.[0] || "?"}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{student.studentName}</h3>
                <Tag
                  color={student.userStatus === "ACTIVE" ? "success" : "error"}
                >
                  {student.userStatus}
                </Tag>
              </div>
              <p className="text-gray-500">
                Student ID: #{studentId.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Gender" value={student.gender} />
            <InfoField
              label="DOB"
              value={new Date(student.dob).toLocaleDateString()}
            />
            <InfoField label="Email Address" value={student.email} />
            <InfoField label="Phone Number" value={student.phone} />
            <InfoField
              label="College/University"
              value={student.college || "NA"}
            />
            <InfoField label="Degree" value={student.degree || "NA"} />
            <InfoField
              label="Specializations"
              value={student.specialization || "NA"}
            />
            <InfoField label="Location" value={student.address || "NA"} />
            <InfoField label="Start Year" value={student.startYear || "NA"} />
            <InfoField label="End Year" value={student.endYear || "NA"} />
            <InfoField
              label="KYC Status"
              value={
                <Tag color={student.kycStatus ? "success" : "error"}>
                  {student.kycStatus ? "Verified" : "Not Verified"}
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
