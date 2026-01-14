import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "An unknown error occurred";
};
