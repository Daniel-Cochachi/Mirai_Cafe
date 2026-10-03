import {
    useEffect,
    useState,
} from 'react'

import {
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react'

import {
    useNavigate,
} from 'react-router-dom'

import axios from 'axios'

import { Footer } from '../components/layout/footer'
import { Navbar } from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

import type {
    ApiError,
    User,
} from '../types/auth'

function getRoleName(role?: string): string {
    if (!role) return 'Cliente'
    const cleanRole = role.replace(/^ROLE_/, '')
    const roleNames: Record<string, string> = {
        ADMIN: 'Administrador',
        CAJERO: 'Cajero',
        CLIENTE: 'Cliente',
    }

    return roleNames[cleanRole] || cleanRole
}

export function ProfilePage() {
    const navigate = useNavigate()

    const {
        isAuthenticated,
        logout,
    } = useAuth()

    const [profile, setProfile] = useState<User | null>(
        null,
    )

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', {
                replace: true,
            })

            return
        }

        let isMounted = true

        const loadProfile = async () => {
            try {
                setError('')

                const data =
                    await authService.getProfile()

                if (isMounted) {
                    setProfile(data)
                }
            } catch (requestError) {
                if (!isMounted) {
                    return
                }

                if (
                    axios.isAxiosError<ApiError>(
                        requestError,
                    ) &&
                    requestError.response?.status === 401
                ) {
                    logout()

                    navigate('/login', {
                        replace: true,
                    })

                    return
                }

                setError(
                    'No fue posible cargar tu perfil.',
                )
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadProfile()

        return () => {
            isMounted = false
        }
    }, [
        isAuthenticated,
        logout,
        navigate,
    ])

    const initial =
        profile?.nombre
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() || 'M'

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    {/* Encabezado */}
                    <header className="border-b border-white/10 pb-9">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mirai-accent">
                            Mi cuenta
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                            Mi perfil
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                            Consulta la información asociada a tu
                            cuenta de Mirai Café.
                        </p>
                    </header>

                    {isLoading && (
                        <div className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
                            <div className="min-h-80 animate-pulse rounded-3xl bg-white/5" />
                            <div className="min-h-80 animate-pulse rounded-3xl bg-white/5" />
                        </div>
                    )}

                    {!isLoading && error && (
                        <div
                            role="alert"
                            className="mt-10 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                        >
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && profile && (
                        <div className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
                            {/* Resumen */}
                            <aside className="rounded-3xl border border-white/10 bg-[#151515] p-7">
                                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-mirai-accent/30 bg-mirai-accent/10 text-4xl font-bold text-mirai-accent">
                                    {initial}
                                </div>

                                <h2 className="mt-6 text-2xl font-bold text-white">
                                    {profile.nombre}
                                </h2>

                                <p className="mt-2 text-sm text-white/40">
                                    {profile.email}
                                </p>

                                <div className="mt-6 border-t border-white/8 pt-6">
                                    <span
                                        className={[
                                            'inline-flex rounded-full px-3 py-1.5 text-xs font-semibold',
                                            profile.activo
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-red-500/10 text-red-400',
                                        ].join(' ')}
                                    >
                                        {profile.activo
                                            ? 'Cuenta activa'
                                            : 'Cuenta inactiva'}
                                    </span>
                                </div>
                            </aside>

                            {/* Información */}
                            <section className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
                                <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                                            Información personal
                                        </p>

                                        <h2 className="mt-2 text-2xl font-bold text-white">
                                            Datos de la cuenta
                                        </h2>
                                    </div>

                                    <UserRound
                                        size={27}
                                        className="text-white/20"
                                    />
                                </div>

                                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                    <ProfileField
                                        icon={UserRound}
                                        label="Nombre"
                                        value={profile.nombre}
                                    />

                                    <ProfileField
                                        icon={Mail}
                                        label="Correo electrónico"
                                        value={profile.email}
                                    />

                                    <ProfileField
                                        icon={ShieldCheck}
                                        label="Tipo de cuenta"
                                        value={getRoleName(
                                            profile.rol,
                                        )}
                                        className="sm:col-span-2"
                                    />
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    )
}

interface ProfileFieldProps {
    icon: typeof UserRound
    label: string
    value: string
    className?: string
}

function ProfileField({
    icon: Icon,
    label,
    value,
    className = '',
}: ProfileFieldProps) {
    return (
        <div
            className={[
                'rounded-2xl border border-white/8 bg-black/20 p-5',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex items-center gap-2 text-mirai-accent">
                <Icon
                    size={17}
                    strokeWidth={1.8}
                />

                <p className="text-xs font-bold uppercase tracking-[0.14em]">
                    {label}
                </p>
            </div>

            <p className="mt-3 break-words text-sm font-semibold text-white/75">
                {value}
            </p>
        </div>
    )
}