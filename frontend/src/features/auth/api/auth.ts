import api from "@/lib/axios";
import { isAxiosError } from "axios";
import type { AuthResponse, LoginCredentials } from "../types/authTypes";

export const loginUser = async (
  data: LoginCredentials,
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

export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error("An unexpected error occurred.");
  }
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      {
        email,
        token,
        newPassword,
      },
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error("An unexpected error occurred.");
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      "/auth/change-password",
      {
        oldPassword,
        newPassword,
      },
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error("An unexpected error occurred.");
  }
};

export const registerUser = async (data: unknown) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
