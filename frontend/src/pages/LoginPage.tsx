import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import axios from 'axios'
import { ArrowLeft } from 'lucide-react'

import heroCafe from '../assets/hero-cafe.webp'
import { MiraiLogo } from '../components/brand/MiraiLogo'
import { useAuth } from '../context/AuthContext'

import type {
    ApiError,
    LoginRequest,
} from '../types/auth'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [credentials, setCredentials] =
        useState<LoginRequest>({
            email: '',
            password: '',
        })

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(credentials)
            navigate('/')
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setError(
                    requestError.response?.data.message ??
                    'No fue posible iniciar sesión',
                )
            } else {
                setError('Ocurrió un error inesperado')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="grid min-h-screen bg-[#0a0a0a] lg:grid-cols-[1.1fr_0.9fr]">
            {/* Panel de imagen */}
            <section className="relative hidden min-h-screen overflow-hidden lg:block">
                <img
                    src={heroCafe}
                    alt="Café preparado en Mirai Café"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                {/* Oscurecimiento */}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />

                {/* Logo */}
                <Link
                    to="/"
                    className="absolute left-10 top-10 z-20 flex w-fit items-center gap-3 transition hover:opacity-90"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mirai-surface-dark/90 border border-white/15 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                        <MiraiLogo size={34} />
                    </span>

                    <div>
                        <p className="text-lg font-bold leading-none text-white">
                            Mirai Café
                        </p>

                        <p className="mt-1 text-xs text-white/45">
                            Fresco y delicioso
                        </p>
                    </div>
                </Link>

                {/* Texto inferior */}
                <div className="absolute bottom-12 left-10 z-10 max-w-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-mirai-accent">
                        Una experiencia en cada taza
                    </p>

                    <h2 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                        Tu próxima pausa comienza aquí.
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                        Ingresa a tu cuenta para consultar tus
                        pedidos y continuar disfrutando de Mirai
                        Café.
                    </p>
                </div>
            </section>

            {/* Panel del formulario */}
            <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
                {/* Volver */}
                <Link
                    to="/"
                    className="absolute left-5 top-6 inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-mirai-accent sm:left-10 sm:top-8"
                >
                    <ArrowLeft size={18} />
                    Volver
                </Link>

                <div className="w-full max-w-md">
                    {/* Logo visible en celular */}
                    <Link
                        to="/"
                        className="mb-10 flex w-fit items-center gap-3 transition hover:opacity-90 lg:hidden"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mirai-surface-dark/90 border border-white/15 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                            <MiraiLogo size={34} />
                        </span>

                        <div>
                            <p className="text-lg font-bold leading-none text-white">
                                Mirai Café
                            </p>

                            <p className="mt-1 text-xs text-white/45">
                                Fresco y delicioso
                            </p>
                        </div>
                    </Link>

                    {/* Encabezado */}
                    <header>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mirai-accent">
                            Acceso de clientes
                        </p>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                            Bienvenido de nuevo
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                            Ingresa tus datos para acceder a tu
                            cuenta.
                        </p>
                    </header>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                        >
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form
                        className="mt-8 space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-white/75"
                            >
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={credentials.email}
                                onChange={(event) =>
                                    setCredentials({
                                        ...credentials,
                                        email: event.target.value,
                                    })
                                }
                                placeholder="usuario@example.com"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                                className="h-13 w-full rounded-xl border border-white/10 bg-[#151515] px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-white/75"
                            >
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={credentials.password}
                                onChange={(event) =>
                                    setCredentials({
                                        ...credentials,
                                        password:
                                            event.target.value,
                                    })
                                }
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                required
                                disabled={isLoading}
                                className="h-13 w-full rounded-xl border border-white/10 bg-[#151515] px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-13 w-full cursor-pointer items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark focus:outline-none focus:ring-3 focus:ring-mirai-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading
                                ? 'Iniciando sesión...'
                                : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Registro */}
                    <div className="mt-8 border-t border-white/8 pt-6 text-center">
                        <p className="text-sm text-white/40">
                            ¿Todavía no tienes una cuenta?
                        </p>

                        <Link
                            to="/register"
                            className="mt-2 inline-block text-sm font-semibold text-mirai-accent transition hover:text-white"
                        >
                            Crear una cuenta
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}