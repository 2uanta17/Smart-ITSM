export interface Department {
  id: number;
  name: string;
  locationCode: string;
}

export interface CreateDepartmentDto {
  name: string;
  locationCode: string;
}

export interface UpdateDepartmentDto {
  name: string;
  locationCode: string;
}
