export interface Department {
  id: number;
  name: string;
  locationCode: string;
}

export interface CreateDepartmentDto {
  name: string;
  locationCode: string;
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
