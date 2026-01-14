export interface User {
  id: number;
  fullName: string;
  email: string;
  departmentName: string;
  departmentId: number;
  role: string;
  isActive: boolean;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password?: string;
  departmentId: number;
  role: string;
}