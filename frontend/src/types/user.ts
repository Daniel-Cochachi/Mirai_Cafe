export type UserRole = 'ADMIN' | 'CAJERO' | 'CLIENTE'

export interface UserItem {
    id: number
    nombre: string
    email: string
    rol: UserRole
    activo: boolean
}

export interface CreateUserRequest {
    nombre: string
    email: string
    password: string
    rol: UserRole
}

export interface UpdateUserRequest {
    nombre: string
}

export interface ChangeRoleRequest {
    rol: UserRole
}

export interface ChangeStatusRequest {
    activo: boolean
}
