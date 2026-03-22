import api from "@/lib/axios";
import type {
  CreateDepartmentDto,
  Department,
  UpdateDepartmentDto,
} from "../types/departmentTypes";

export const getDepartments = async () => {
  const { data } = await api.get<Department[]>("/departments");
  return data;
};

export const createDepartment = async (dto: CreateDepartmentDto) => {
  const { data } = await api.post<Department>("/departments", dto);
  return data;
};

export const updateDepartment = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateDepartmentDto;
}): Promise<void> => {
  await api.put(`/departments/${id}`, data);
};

export const deleteDepartment = async (id: number) => {
  await api.delete(`/departments/${id}`);
};
