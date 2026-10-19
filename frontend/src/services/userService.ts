import api from './api'
import type {
    UserItem,
    CreateUserRequest,
    UpdateUserRequest,
    ChangeRoleRequest,
    ChangeStatusRequest,
} from '../types/user'

export const userService = {
    // 1. Listar todos los usuarios
    async getAll(): Promise<UserItem[]> {
        const response = await api.get<UserItem[]>('/users')
        return response.data
    },

    // 2. Obtener un usuario por ID
    async getById(id: number): Promise<UserItem> {
        const response = await api.get<UserItem>(`/users/${id}`)
        return response.data
    },

    // 3. Crear usuario
    async create(data: CreateUserRequest): Promise<UserItem> {
        const response = await api.post<UserItem>('/users', data)
        return response.data
    },

    // 4. Actualizar nombre
    async update(id: number, data: UpdateUserRequest): Promise<UserItem> {
        const response = await api.patch<UserItem>(`/users/${id}`, data)
        return response.data
    },

    // 5. Cambiar rol
    async changeRole(id: number, data: ChangeRoleRequest): Promise<UserItem> {
        const response = await api.patch<UserItem>(`/users/${id}/role`, data)
        return response.data
    },

    // 6. Activar o desactivar usuario
    async changeStatus(id: number, data: ChangeStatusRequest): Promise<UserItem> {
        const response = await api.patch<UserItem>(`/users/${id}/status`, data)
        return response.data
    },
}
