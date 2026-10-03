import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react'

import { authService } from '../services/authService'

import type {
    AuthUser,
    LoginRequest,
} from '../types/auth'

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    isAuthenticated: boolean
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => void
}

interface AuthProviderProps {
    children: ReactNode
}

const AuthContext = createContext<
    AuthContextValue | undefined
>(undefined)

function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem('auth_user')

    if (!storedUser) {
        return null
    }

    try {
        return JSON.parse(storedUser) as AuthUser
    } catch {
        localStorage.removeItem('auth_user')
        return null
    }
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(
        getStoredUser,
    )

    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('token'),
    )

    const login = async (
        credentials: LoginRequest,
    ): Promise<void> => {
        const response =
            await authService.login(credentials)

        const authenticatedUser: AuthUser = {
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
        }

        localStorage.setItem('token', response.token)
        localStorage.setItem(
            'auth_user',
            JSON.stringify(authenticatedUser),
        )

        setToken(response.token)
        setUser(authenticatedUser)
    }

    const logout = (): void => {
        localStorage.removeItem('token')
        localStorage.removeItem('auth_user')

        setToken(null)
        setUser(null)
    }

    const value: AuthContextValue = {
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error(
            'useAuth debe utilizarse dentro de AuthProvider',
        )
    }

    return context
}