export interface ProfileImage {
    id: number;
    name: string;
    url: string;
}
  
export interface User {
    id: number;
    email: string;
    name?: string;
    username?: string;
    mobile?: string;
    avatar?: string;
    profileImage?: ProfileImage;
    role?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}
  
export interface LoginRequest {
    email: string;
    password: string;
}
  
export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
    refresh_token?: string; // Support both naming conventions
    message?: string;
}
  
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
  
export interface AuthError {
    message: string;
    code?: string;
    status?: number;
}
  
export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}
  