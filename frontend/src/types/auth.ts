export type UserRole = 'ADMIN' | 'CAJERO' | 'CLIENTE'

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    nombre: string
    email: string
    password: string
}

export interface AuthResponse {
    token: string
    id: number
    nombre: string
    email: string
    rol: UserRole
}

export interface AuthUser {
    id: number
    nombre: string
    email: string
    rol: UserRole
}

export interface User {
    id: number
    nombre: string
    email: string
    rol: UserRole
    activo: boolean
    fechaRegistro: string
}

export interface ApiError {
    status: number
    message: string
    timestamp: string
}