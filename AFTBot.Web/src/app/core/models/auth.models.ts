export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  displayName: string;
  expiresAt: string;
}

export interface AdminUser {
  username: string;
  displayName: string;
  role: string;
}

export interface AdminUserDetail {
  adminUserId: number;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdDate: string;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: string;
}
