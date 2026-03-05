export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    phone?: string;
    address?: string;
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
}
