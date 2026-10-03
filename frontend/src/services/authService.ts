import api from './api'
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
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
}