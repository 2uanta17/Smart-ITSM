export interface User {
  id: string;
  email: string;
  role: string;
  exp?: number;
}

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub?: string;
  id?: string;
  email: string;
  role: string;
  exp: number;
}
