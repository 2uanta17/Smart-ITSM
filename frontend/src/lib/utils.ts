import { isAxiosError } from "axios";

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
  const safeDateString = dateString.endsWith("Z")
    ? dateString
    : dateString + "Z";
  return new Date(safeDateString).toLocaleString();
};

export const formatLocalDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const safeDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  return new Date(safeDateString).toLocaleDateString(); 
};
