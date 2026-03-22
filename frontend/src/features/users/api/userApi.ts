import api from "@/lib/axios";
import type { CreateUserDto, UpdateUserDto, User } from "../types/userTypes";

export const getUsers = async () => {
  const { data } = await api.get<User[]>("/users");
  return data;
};

export const createUser = async (dto: CreateUserDto) => {
  const { data } = await api.post<User>("/users", dto);
  return data;
};

export const updateUser = async (id: number, dto: UpdateUserDto) => {
  await api.put(`/users/${id}`, dto);
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};
