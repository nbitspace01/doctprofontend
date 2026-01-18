import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Modal,
  message,
  UploadProps,
  App,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../Common/authUtils";
import dayjs from "dayjs";
import { createJobPostApi, updateJobPostApi } from "../../api/jobpost.api";
import { TOKEN, USER_ID } from "../Common/constant.function";
import { showError, showSuccess } from "../Common/Notification";

interface JobPostData {
  id: string;
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  status: string;
  noOfApplications?: number;
  valid_from?: string;
  expires_at?: string;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
}

interface CreateJobPostProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: JobPostData | null;
}

interface JobPostFormValues {
  title: string;
  specialization: string;
  location: string;
  experience_required: string;
  workType: string;
  valid_from?: Date;
  expires_at?: Date;
  description?: string;
  hospital_bio?: string;
  salary?: string;
  degree_required?: string;
  hospital_website?: string;
}

const CreateJobPost: React.FC<CreateJobPostProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        experience_required: initialData.experience_required,
        salary: initialData.salary,
        location: initialData.location || "chennai",
        workType : initialData.workType,
        degree_required: initialData.degree_required,
        specialization: initialData.specialization,
        description: initialData.description,
        hospital_website: initialData.hospital_website,
        hospital_bio: initialData.hospital_bio,
        valid_from: initialData.valid_from
          ? dayjs(initialData.valid_from, "YYYY-MM-DD")
          : undefined,
        expires_at: initialData.expires_at
          ? dayjs(initialData.expires_at, "YYYY-MM-DD")
          : undefined,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const createJobPostMutation = useMutation({
    mutationFn: (jobData: any) =>
      initialData
        ? updateJobPostApi(initialData.id, jobData)
        : createJobPostApi(jobData),
    onSuccess: (data: any) => {
      showSuccess(notification, {
        message: initialData
          ? "Job Post Updated Successfully"
          : "Job Post Created Successfully",
        description: data.message,
      });
      form.resetFields();
      onCancel();
      onSubmit(data);
    },
    onError: (error: any) => {
      showError(notification, {
        message: initialData
          ? "Failed to update job post"
          : "Failed to craete job post",
        description:
          error.response?.data?.error || initialData
            ? "Failed to update job post"
            : "Failed to craete job post",
      });
    },
  });

  const handleSubmit = (values: JobPostFormValues) => {
    const payload = {
      title: values.title,
      experience_required: values.experience_required,
      salary: values.salary,
      location: values.location,
      workType: values.workType,
      degree_required: values.degree_required,
      specialization: values.specialization,
      description: values.description,
      hospital_website: values.hospital_website,
      hospital_bio: values.hospital_bio,
      valid_from: values.valid_from ? new Date(values.valid_from).toLocaleDateString("en-IN") : "-",
      expires_at: values.expires_at ? new Date(values.expires_at).toLocaleDateString("en-IN") : "-",
    };

    createJobPostMutation.mutate(payload);
  };

  const handleSaveDraft = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        status: "pending",
      };
      createJobPostMutation.mutate(payload);
    });
  };

  return (
    <Modal
      title={isEditMode ? "Edit Job Post" : "Create New Job Post"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div className="max-w-3xl mx-auto p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label="Job Title"
            name="title"
            rules={[{ required: true, message: "Please enter job title" }]}
          >
            <Input placeholder="Enter Ad Title" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Exp Required"
              name="experience_required"
              rules={[{ required: true, message: "Please select experience" }]}
            >
              <Select placeholder="Select Exp">
                <Select.Option value="0-1 Yrs">0-1 Yrs</Select.Option>
                <Select.Option value="1-3 Yrs">1-3 Yrs</Select.Option>
                <Select.Option value="3-5 Yrs">3-5 Yrs</Select.Option>
                <Select.Option value="5-8 Yrs">5-8 Yrs</Select.Option>
                <Select.Option value="8+ Yrs">8+ Yrs</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Salary"
              name="salary"
              rules={[
                { required: true, message: "Please select salary range" },
              ]}
            >
              <Select placeholder="Select Salary Range">
                <Select.Option value="0-2 LPA">0-2 LPA</Select.Option>
                <Select.Option value="2-5 LPA">2-5 LPA</Select.Option>
                <Select.Option value="5-10 LPA">5-10 LPA</Select.Option>
                <Select.Option value="10-15 LPA">10-15 LPA</Select.Option>
                <Select.Option value="15+ LPA">15+ LPA</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="Enter Location" />
          </Form.Item>

          <Form.Item
            label="Employment Type"
            name="workType"
            rules={[
              { required: true, message: "Please select employment type" },
            ]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Full Time">Full Time</Select.Option>
              <Select.Option value="Part Time">Part Time</Select.Option>
              <Select.Option value="Contract">Contract</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Degree Required"
            name="degree_required"
            rules={[{ required: true, message: "Please select degree" }]}
          >
            <Select placeholder="Select degree">
              <Select.Option value="MBBS">MBBS</Select.Option>
              <Select.Option value="BDS">BDS</Select.Option>
              <Select.Option value="BAMS">BAMS</Select.Option>
              <Select.Option value="BHMS">BHMS</Select.Option>
              <Select.Option value="BPT">BPT</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[
              { required: true, message: "Please select specialization" },
            ]}
          >
            <Select placeholder="Select Specialization">
              <Select.Option value="General Medicine">
                General Medicine
              </Select.Option>
              <Select.Option value="Cardiology">Cardiology</Select.Option>
              <Select.Option value="Dentistry">Dentistry</Select.Option>
              <Select.Option value="Orthopedics">Orthopedics</Select.Option>
              <Select.Option value="Pediatrics">Pediatrics</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Job Description"
            name="description"
            rules={[
              { required: true, message: "Please enter job description" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe the responsibilities, Qualification, and other details about the job.."
            />
          </Form.Item>

          <div>
            <h3 className="font-semibold mb-4">Hospital Details*</h3>
            <div className="space-y-4">
              <Form.Item
                label="Hospital Website"
                name="hospital_website"
                rules={[
                  { required: true, message: "Please enter hospital website" },
                ]}
              >
                <Input placeholder="http://www.appolo.com" />
              </Form.Item>

              <Form.Item
                label="Bio"
                name="hospital_bio"
                rules={[{ required: true, message: "Please enter bio" }]}
              >
                <Input.TextArea rows={4} placeholder="Type Something...." />
              </Form.Item>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Application Deadline*</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Start Date"
                name="valid_from"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="MM/DD/YYYY"
                  placeholder="MM/DD/YYYY"
                />
              </Form.Item>

              <Form.Item
                label="End Date"
                name="expires_at"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker
                  className="w-full"
                  format="MM/DD/YYYY"
                  placeholder="MM/DD/YYYY"
                />
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-between space-x-4 mt-6">
            <Button
              onClick={handleSaveDraft}
              className="px-6 border-blue-600 text-blue-600"
            >
              Save as Draft
            </Button>
            <div className="flex gap-2">
              <Button onClick={onCancel} className="px-6">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="px-6 bg-button-primary"
                loading={createJobPostMutation.isPending}
              >
                {isEditMode ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateJobPost;
