import { Button } from "antd";
import HospitalRegistration from "../../Registration/HospitalRegistration";

const ClinicsList = () => {
  return (
    <div>
      <h1>Clinics List</h1>
      <Button>Add Clinic</Button>
      <HospitalRegistration />
    </div>
  );
};

export default ClinicsList;
