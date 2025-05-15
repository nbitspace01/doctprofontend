import { Drawer, Switch, Button, Tag, Image } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";

interface HealthCareProfessional {
  id: string;
  name: string;
  role: string;
  userType: string;
  gender: string;
  location: string;
  dob: string;
  email: string;
  phone: string;
  degree: string;
  specialization: string;
  startYear: number;
  endYear: number;
  qualification: string;
  experience: {
    organization: string;
    location: string;
    from: string;
    to: string;
  };
  kyc_status: boolean;
  kyc_doc_url: string;
  registrationDate: string;
  status: string;
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
  const { data, isLoading } = useQuery({
    queryKey: ["healthcareProfessional", professionalId],
    queryFn: async () => {
      const response = await axios.get<HealthCareProfessional>(
        `http://localhost:3000/api/healthCare/healthcare-professionals/${professionalId}`
      );
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={500}
      title="Healthcare Professional"
      extra={<Button onClick={onClose}>Close</Button>}
    >
      {data && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-button-primary rounded-full flex items-center justify-center text-white text-xl">
                {data.name?.[0] || "?"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{data.name}</h2>
                <p className="text-gray-600">{data.userType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Active</span>
              <Switch defaultChecked={data.status === "ACTIVE"} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Email Address" value={data.email} />
            <DetailItem label="Phone Number" value={data.phone} />
            <DetailItem label="Role" value={data.role || data.userType} />
            <DetailItem label="Gender" value={data.gender} />
            <DetailItem label="Location" value={data.location} />
            <DetailItem label="DOB" value={formatDate(data.dob)} />
            <DetailItem label="Degree" value={data.qualification} />
            <DetailItem label="Specialization" value={data.specialization} />
            <DetailItem
              label="Start Year"
              value={data.startYear?.toString() || "N/A"}
            />
            <DetailItem
              label="End Year"
              value={data.endYear?.toString() || "N/A"}
            />
            <DetailItem
              label="KYC Status"
              value={data.kyc_status ? "Verified" : "Pending"}
            />

            <DetailItem
              label="Date of Registration"
              value={formatDate(data.registrationDate)}
            />
          </div>

          {/* KYC Documents Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">KYC Documents</h3>
            <div className="border rounded-lg p-4">
              {data.kyc_doc_url ? (
                <Image
                  preview={false}
                  src={data.kyc_doc_url}
                  alt="KYC Document"
                  className="w-full object-contain"
                />
              ) : (
                <p>No KYC document available.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button danger>Reject</Button>
            <Button className="bg-gray-200">Cancel</Button>
            <Button type="primary" className="bg-button-primary">
              Verify Account
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default HealthCareView;
