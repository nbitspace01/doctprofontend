import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, Modal } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../Common/authUtils";
import dayjs from "dayjs";

interface JobPost {
  id?: string;
  jobTitle: string;
  specialization: string;
  location: string;
  expRequired: string;
  employmentType: string;
  postDate?: string;
  endDate?: string;
  description?: string;
  hospitalBio?: string[];
  salary?: string;
  degreeRequired?: string;
  hospitalWebsite?: string;
}

interface CreateJobPostProps {
  open: boolean;
  onClose: () => void;
  editingJob?: JobPost | null;
}

const CreateJobPost: React.FC<CreateJobPostProps> = ({ open, onClose, editingJob }) => {
  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_BASE_URL_BACKEND;

  useEffect(() => {
    if (open && editingJob) {
      form.setFieldsValue({
        jobTitle: editingJob.jobTitle,
        expRequired: editingJob.expRequired,
        salary: editingJob.salary,
        location: editingJob.location,
        employmentType: editingJob.employmentType,
        degreeRequired: editingJob.degreeRequired,
        specialization: editingJob.specialization,
        jobDescription: editingJob.description || "",
        hospitalWebsite: editingJob.hospitalWebsite || "http://www.appolo.com",
        bio: editingJob.hospitalBio?.join("\n") || "",
        startDate: editingJob.postDate ? dayjs(editingJob.postDate, "YYYY-MM-DD") : undefined,
        endDate: editingJob.endDate ? dayjs(editingJob.endDate, "YYYY-MM-DD") : undefined,
      });
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        hospitalWebsite: "http://www.appolo.com",
      });
    }
  }, [open, editingJob, form]);

  const createJobPostMutation = useMutation({
    mutationFn: (jobData: any) => {
      const url = editingJob?.id 
        ? `${API_URL}/api/job-posts/${editingJob.id}`
        : `${API_URL}/api/job-posts`;
      const method = editingJob?.id ? "put" : "post";
      return axios[method](url, jobData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    },
    onSuccess: () => {
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      console.error("Error saving job post:", error);
    },
  });

  const handleSubmit = (values: any) => {
    const payload = {
      jobTitle: values.jobTitle,
      expRequired: values.expRequired,
      salary: values.salary,
      location: values.location,
      employmentType: values.employmentType,
      degreeRequired: values.degreeRequired,
      specialization: values.specialization,
      description: values.jobDescription,
      hospitalWebsite: values.hospitalWebsite,
      hospitalBio: values.bio?.split("\n").filter((line: string) => line.trim()),
      postDate: values.startDate?.format("YYYY-MM-DD"),
      endDate: values.endDate?.format("YYYY-MM-DD"),
    };

    createJobPostMutation.mutate(payload);
  };

  const handleSaveDraft = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        status: "draft",
      };
      createJobPostMutation.mutate(payload);
    });
  };

  return (
    <Modal open={open} onCancel={onClose} width={800} footer={null}>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Post A New Job</h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label="Job Title"
            name="jobTitle"
            rules={[{ required: true, message: "Please enter job title" }]}
          >
            <Input placeholder="Enter Ad Title" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Exp Required"
              name="expRequired"
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
              rules={[{ required: true, message: "Please select salary range" }]}
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
            name="employmentType"
            rules={[{ required: true, message: "Please select employment type" }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Full Time">Full Time</Select.Option>
              <Select.Option value="Part Time">Part Time</Select.Option>
              <Select.Option value="Contract">Contract</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Degree Required"
            name="degreeRequired"
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
            rules={[{ required: true, message: "Please select specialization" }]}
          >
            <Select placeholder="Select Specialization">
              <Select.Option value="General Medicine">General Medicine</Select.Option>
              <Select.Option value="Cardiology">Cardiology</Select.Option>
              <Select.Option value="Dentistry">Dentistry</Select.Option>
              <Select.Option value="Orthopedics">Orthopedics</Select.Option>
              <Select.Option value="Pediatrics">Pediatrics</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Job Description"
            name="jobDescription"
            rules={[{ required: true, message: "Please enter job description" }]}
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
                name="hospitalWebsite"
                rules={[{ required: true, message: "Please enter hospital website" }]}
              >
                <Input placeholder="http://www.appolo.com" />
              </Form.Item>

              <Form.Item
                label="Bio"
                name="bio"
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
                name="startDate"
                rules={[{ required: true, message: "Please select start date" }]}
              >
                <DatePicker
                  className="w-full"
                  format="MM/DD/YYYY"
                  placeholder="MM/DD/YYYY"
                />
              </Form.Item>

              <Form.Item
                label="End Date"
                name="endDate"
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
              <Button onClick={onClose} className="px-6">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="px-6 bg-button-primary"
                loading={createJobPostMutation.isPending}
              >
                Proceed
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateJobPost;
