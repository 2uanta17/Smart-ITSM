import api from "@/lib/axios";

export interface Category {
  id: number;
  name: string;
  defaultPriority?: string;
}

export const getCategories = async () => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};
