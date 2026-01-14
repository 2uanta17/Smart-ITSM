import api from "@/lib/axios";
import type { User, CreateUserDto } from "../types/userTypes";

export const getUsers = async () => {
  const { data } = await api.get<User[]>("/users");
  return data;
};

export const createUser = async (dto: CreateUserDto) => {
  const { data } = await api.post<User>("/users", dto);
  return data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};
