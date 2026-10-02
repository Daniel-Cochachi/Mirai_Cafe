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

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
)

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)

    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('token'),
    )

    const login = async (
        credentials: LoginRequest,
    ): Promise<void> => {
        const response = await authService.login(credentials)

        localStorage.setItem('token', response.token)

        setToken(response.token)

        setUser({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
        })
    }

    const logout = (): void => {
        localStorage.removeItem('token')

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

