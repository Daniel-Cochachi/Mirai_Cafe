import api from './api'
import type {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    User,
} from '../types/auth'

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>(
            '/auth/login',
            credentials,
        )

        return response.data
    },

    async register(
        userData: RegisterRequest,
    ): Promise<User> {
        const response = await api.post<User>(
            '/auth/register',
            userData,
        )

        return response.data
    },

    async getProfile(): Promise<User> {
        const response = await api.get<User>(
            '/auth/me',
        )

        return response.data
    },

    async updateProfile(
        data: UpdateProfileRequest,
    ): Promise<User> {
        const response = await api.patch<User>(
            '/auth/me',
            data,
        )

        return response.data
    },

    async changePassword(
        data: ChangePasswordRequest,
    ): Promise<{ message?: string }> {
        const response = await api.patch<{ message?: string }>(
            '/auth/me/password',
            data,
        )

        return response.data
    },
}