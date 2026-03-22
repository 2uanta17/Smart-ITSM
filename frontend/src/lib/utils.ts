import { isAxiosError } from "axios";

const HAS_TIMEZONE_SUFFIX = /(Z|[+-]\d{2}:\d{2})$/i;

export const normalizeApiDateString = (dateString: string) => {
  if (!dateString) return "";

  return HAS_TIMEZONE_SUFFIX.test(dateString) ? dateString : `${dateString}Z`;
};

export const parseApiDate = (dateString: string) => {
  const normalized = normalizeApiDateString(dateString);
  return new Date(normalized);
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "An unknown error occurred";
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "yellow";
    case "Low":
      return "green";
    default:
      return "gray";
  }
};

export const formatLocalTime = (dateString: string) => {
  if (!dateString) return "N/A";

  return parseApiDate(dateString).toLocaleString();
};

export const formatLocalDate = (dateString: string) => {
  if (!dateString) return "N/A";

  return parseApiDate(dateString).toLocaleDateString();
};

export const formatLocalClockTime = (dateString: string) => {
  if (!dateString) return "N/A";

  return parseApiDate(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
