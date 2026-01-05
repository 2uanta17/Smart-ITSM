import api from "@/lib/axios";
import type { AuthResponse, LoginCredentials } from "../types/authTypes";
import { isAxiosError } from "axios";

export const loginUser = async (
  data: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error("An unexpected error occurred during login.");
  }
};

// TODO: Register Function
export const registerUser = async (data: unknown) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
