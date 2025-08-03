export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UserListResponse {
  success: boolean;
  data: {
    content: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
  message: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserUpdateResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    [key in UserRole]: number;
  };
} 