// import { Modal, Select, Form, Input, Button, notification } from "antd";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import React, { useEffect } from "react";
// import { updateCollegeApi, useCollegeById } from "../../../api/college.api";
// import { fetchHospitalListApi } from "../../../api/hospital.api";

// interface EditCollegeModalProps {
//   visible: boolean;
//   onClose: () => void;
//   collegeId: string | null;
// }

// interface CollegePayload {
//   name: string;
//   city: string;
//   district: string;
//   state: string;
//   associatedHospital: string;
//   hospitalIds: string[];
// }

// const EditCollegeModal: React.FC<EditCollegeModalProps> = ({
//   visible,
//   onClose,
//   collegeId,
// }) => {
//   const [form] = Form.useForm();
//   const queryClient = useQueryClient();
//   // Fetch college data for editing
//   const { data: collegeData, isLoading: isLoadingCollege } = useCollegeById(collegeId!);

//   // Fetch associated hospitals
//   const associatedHospital = useQuery({
//     queryKey: ["associatedHospital"],
//     queryFn: fetchHospitalListApi,
//   });

//   // Update college mutation
//   const updateCollegeMutation = useMutation({
//     mutationFn: async (data: CollegePayload) => {
//       return await updateCollegeApi(collegeId!, data);
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["Colleges"] });
//       queryClient.invalidateQueries({ queryKey: ["college", collegeId] });
//       notification.success({
//         message: "College Updated Successfully",
//         description: data.message,
//       });
//       form.resetFields();
//       onClose();
//     },
//     onError: (error: any) => {
//       notification.error({
//         message: "Update Failed",
//         description: error.message || "Failed to update college",
//       });
//     },
//   });

//   // Prefill form when college data is loaded and modal is visible
//   useEffect(() => {
//     if (collegeData && visible && collegeId) {
//       const college = collegeData; // API returns data directly, not nested under 'data'
//       console.log("Setting form values with college data:", college);
//       form.setFieldsValue({
//         name: college.name,
//         city: college.city,
//         district: college.district,
//         state: college.state,
//         hospitalIds:
//           college.hospitals?.map((hospital: any) => hospital.id) || [],
//       });
//     }
//   }, [collegeData, visible, collegeId, form]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!visible) {
//       form.resetFields();
//     }
//   }, [visible, form]);

//   // Early return if the modal is not visible
//   if (!visible) return null;

//   const handleSubmit = async (values: CollegePayload) => {
//     console.log("Updating college with values:", values);
//     try {
//       await updateCollegeMutation.mutateAsync(values);
//     } catch (error) {
//       console.error("Error updating college:", error);
//     }
//   };

//   return (
//     <Modal
//       title="Edit College"
//       open={visible}
//       onCancel={onClose}
//       footer={null}
//       width={600}
//     >
//       {isLoadingCollege ? (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       ) : (
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleSubmit}
//           className="mt-4"
//         >
//           <Form.Item
//             label="College Name"
//             name="name"
//             rules={[{ required: true, message: "Please enter college name" }]}
//           >
//             <Input placeholder="Enter College Name" className="w-full" />
//           </Form.Item>

//           <Form.Item
//             label="City/Town"
//             name="city"
//             rules={[{ required: true, message: "Please enter city" }]}
//           >
//             <Input placeholder="Enter Location" className="w-full" />
//           </Form.Item>

//           <Form.Item
//             label="District"
//             name="district"
//             rules={[{ required: true, message: "Please select district" }]}
//           >
//             <Select placeholder="Select District">
//               <Select.Option value="Chennai">Chennai</Select.Option>
//               <Select.Option value="Coimbatore">Coimbatore</Select.Option>
//               <Select.Option value="Madurai">Madurai</Select.Option>
//               <Select.Option value="Salem">Salem</Select.Option>
//               <Select.Option value="Erode">Erode</Select.Option>
//               <Select.Option value="Thanjavur">Thanjavur</Select.Option>
//               <Select.Option value="Tiruchirappalli">
//                 Tiruchirappalli
//               </Select.Option>
//             </Select>
//           </Form.Item>

//           <Form.Item
//             label="State"
//             name="state"
//             rules={[{ required: true, message: "Please select state" }]}
//           >
//             <Select placeholder="Select State">
//               <Select.Option value="Tamil Nadu">Tamil Nadu</Select.Option>
//             </Select>
//           </Form.Item>

//           <Form.Item
//             label="Associated Hospital"
//             name="hospitalIds"
//             rules={[
//               { required: true, message: "Please select associated hospital" },
//             ]}
//           >
//             <Select
//               mode="multiple"
//               placeholder="Select Associated Hospital"
//               className="w-full"
//             >
//               {associatedHospital.data?.map((hospital: any) => (
//                 <Select.Option key={hospital.id} value={hospital.id}>
//                   {hospital.name}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <div className="flex justify-end gap-3 mt-6">
//             <Button onClick={onClose}>Cancel</Button>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={updateCollegeMutation.isPending}
//               className="bg-button-primary hover:!bg-button-primary"
//             >
//               Update
//             </Button>
//           </div>
//         </Form>
//       )}
//     </Modal>
//   );
// };

// export default EditCollegeModal;
