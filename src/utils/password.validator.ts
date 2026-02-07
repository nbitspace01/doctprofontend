import { RuleObject } from "antd/es/form";

export const strongPasswordValidator = (
  message?: string,
): RuleObject["validator"] => {
  return async (_, value) => {
    if (!value) return Promise.resolve();

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(value)) {
      return Promise.reject(
        new Error(
          message ??
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        ),
      );
    }

    return Promise.resolve();
  };
};

export const confirmPasswordValidator = (
  getFieldValue: (name: string) => string,
  passwordField = "password",
): RuleObject["validator"] => {
  return async (_, value) => {
    if (!value || getFieldValue(passwordField) === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match"));
  };
};
