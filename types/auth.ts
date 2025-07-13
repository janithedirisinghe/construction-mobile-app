// types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
