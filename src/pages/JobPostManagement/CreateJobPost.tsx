import React, { useEffect, useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createJobPostApi, updateJobPostApi } from "../../api/jobpost.api";
import { showError, showSuccess } from "../Common/Notification";
import { fetchDegreesApi } from "../../api/degree.api";
import { getCountries, getDistricts, getStates } from "../../api/location.api";
import { CreateJobPostProps, JobPostBase, JobPostFormValues } from "./jobPostTypes";

const CreateJobPost: React.FC<CreateJobPostProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [countryId, setCountryId] = useState<string | null>(null);

  const [states, setStates] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { label: string; value: string; key: string }[]
  >([]);

  const isEditMode = Boolean(initialData);
  const toDayjs = (value?: string) =>
    value
      ? dayjs(value, "YYYY-MM-DD", true).isValid()
        ? dayjs(value, "YYYY-MM-DD")
        : dayjs(value)
      : undefined;
  const findOption = (options: any[], value?: string | null) => {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();
    return options.find((opt) => {
      const optValue = String(opt.value ?? "").trim();
      const optKey = String(opt.key ?? "").trim();
      const optLabel = String(opt.label ?? "").trim();
      return (
        optValue === value ||
        optKey === value ||
        optLabel.toLowerCase() === normalized
      );
    });
  };

  const resolveOptionId = (options: any[], value?: string | null) =>
    findOption(options, value)?.value ?? value;

  const { data: degreesResponse, isFetching: isFetchingDegrees } = useQuery({
    queryKey: ["degrees"],
    queryFn: () =>
      fetchDegreesApi({ page: 1, limit: 1000 }).then((res) => res.data),
    enabled: open,
  });

  /* -------------------- Location Logic -------------------- */
  useEffect(() => {
    if (!open) return;

    const setupLocation = async () => {
      form.resetFields();
      setStates([]);
      setDistricts([]);

      // 1️⃣ Fetch countries
      const countryData = await getCountries();

      // 2️⃣ Decide default country
      const resolvedCountryId =
        initialData?.countryId ??
        countryData.find(
          (c: any) =>
            c.id === initialData?.country ||
            String(c.name || "")
              .toLowerCase()
              .trim() ===
              String(initialData?.country || "")
                .toLowerCase()
                .trim(),
        )?.id ??
        countryData.find((c: any) => c.is_default)?.id ??
        countryData[0]?.id;

      if (!resolvedCountryId) return;

      setCountryId(resolvedCountryId);

      // 3️⃣ Fetch states for that country
      const stateData = await getStates(resolvedCountryId);
      const mappedStates = stateData.map((s: any) => ({
        label: s.name,
        value: s.id,
      }));
      setStates(mappedStates);

      // 4️⃣ EDIT MODE: fetch districts also
      const stateId =
        initialData?.stateId ??
        resolveOptionId(mappedStates, initialData?.state);

      if (stateId) {
        const districtData = await getDistricts(stateId);
        const districtOptions = districtData.map((d: any) => ({
          label: d.name,
          value: d.id,
        }));
        setDistricts(districtOptions);
        const districtId =
          initialData?.districtId ??
          resolveOptionId(districtOptions, initialData?.district);
        if (initialData) {
          form.setFieldsValue({
            district: districtId ?? initialData.district,
          });
        }
      }

      // 5️⃣ Set form values LAST
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          state: stateId ?? initialData.state,
          district: initialData.districtId ?? initialData.district,
          valid_from: toDayjs(initialData.valid_from),
          expires_at: toDayjs(initialData.expires_at),
        });
      }
    };

    setupLocation();
  }, [open, initialData, form]);

  const handleStateChange = async (stateId: string) => {
    try {
      const districtData = await getDistricts(stateId);
      setDistricts(
        districtData.map((d: any) => ({
          label: d.name,
          value: d.id,
        })),
      );

      form.setFieldsValue({ district: undefined });
    } catch (err) {
      console.error("Failed to fetch districts", err);
    }
  };

  const degrees = degreesResponse ?? [];
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        experience_required: initialData.experience_required,
        salary: initialData.salary,
        // location: initialData.location || "chennai",
        country: initialData.countryId ?? initialData.country,
        state: initialData.stateId ?? initialData.state,
        district: initialData.districtId ?? initialData.district,
        workType: initialData.workType,
        degree_required: initialData.degree_required,
        specialization: initialData.specialization,
        description: initialData.description,
        hospital_website: initialData.hospital_website,
        hospital_bio: initialData.hospital_bio,
        valid_from: toDayjs(initialData.valid_from),
        expires_at: toDayjs(initialData.expires_at),
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
      // location: values.location,
      countryId,
      stateId: values.state,
      districtId: values.district,
      workType: values.workType,
      degree_required: values.degree_required,
      specialization: values.specialization,
      description: values.description,
      hospital_website: values.hospital_website,
      hospital_bio: values.hospital_bio,
      valid_from: values.valid_from
        ? new Date(values.valid_from).toLocaleDateString("en-IN")
        : "-",
      expires_at: values.expires_at
        ? new Date(values.expires_at).toLocaleDateString("en-IN")
        : "-",
    };

    createJobPostMutation.mutate(payload);
  };

  const handleSaveDraft = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        countryId,
        stateId: values.state,
        districtId: values.district,
        status: "DRAFT",
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
      width={600}
    >
      <div className="max-w-3xl mx-auto p-4">
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

          {/* <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="Enter Location" />
          </Form.Item> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "Please select state" }]}
            >
              <Select
                placeholder="Select State"
                options={states}
                showSearch
                optionFilterProp="label"
                onChange={handleStateChange}
              />
            </Form.Item>

            <Form.Item
              label="District"
              name="district"
              rules={[{ required: true, message: "Please select district" }]}
            >
              <Select
                placeholder="Select District"
                options={districts}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

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
            <Select
              placeholder="Select degree"
              loading={isFetchingDegrees}
              options={degrees.map((d: any) => ({
                value: d.name,
                label: d.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[
              { required: true, message: "Please select specialization" },
            ]}
          >
            <Select
              placeholder="Select Specialization"
              loading={isFetchingDegrees}
              options={degrees.map((s: any) => ({
                value: s.specialization,
                label: s.specialization,
              }))}
            />
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
                  onChange={() => form.setFieldsValue({ expires_at: null })}
                  format="MM/DD/YYYY"
                  placeholder="MM/DD/YYYY"
                  disabledDate={(current) => {
                    const today = dayjs().startOf("day");
                    const oneYearLater = dayjs().add(1, "year").endOf("day");

                    return (
                      current && (current < today || current > oneYearLater)
                    );
                  }}
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
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("valid_from");
                    const today = dayjs().startOf("day");

                    if (!current) return false;

                    // If start date not selected yet
                    if (!startDate) {
                      return current < today;
                    }

                    const start = dayjs(startDate).startOf("day");
                    const maxEndDate = start.add(30, "day").endOf("day");

                    return (
                      current < start || // before start date
                      current < today || // past dates
                      current > maxEndDate // after 30 days from start
                    );
                  }}
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
