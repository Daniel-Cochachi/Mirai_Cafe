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

import { useAuth } from '../context/AuthContext'
import { MiraiLogo } from '../components/brand/MiraiLogo'

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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mirai-cream px-4 py-10">
            {/* Elementos decorativos del fondo */}
            <div
                aria-hidden="true"
                className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-mirai-primary-soft"
            />

            <div
                aria-hidden="true"
                className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-amber-100/70"
            />

            <section className="relative z-10 w-full max-w-md">
                {/* Enlace al inicio */}
                <Link
                    to="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-mirai-muted transition hover:text-mirai-primary"
                >
                    <ArrowLeft size={18} />

                    Volver al inicio
                </Link>

                {/* Formulario */}
                <div className="rounded-2xl border border-mirai-border bg-mirai-surface p-7 shadow-[0_12px_40px_rgba(13,63,42,0.08)] sm:p-9">
                    <header className="mb-8 text-center">
                        <Link
                            to="/"
                            className="mx-auto flex w-fit items-center justify-center"
                            aria-label="Ir al inicio de Mirai Café"
                        >
                            <span className="flex h-18 w-18 items-center justify-center rounded-2xl bg-mirai-primary text-white shadow-sm">
                                <MiraiLogo size={45} />
                            </span>
                        </Link>

                        <h1 className="mt-5 text-3xl font-bold text-mirai-primary-dark">
                            Bienvenido
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-mirai-muted">
                            Inicia sesión para continuar en Mirai Café
                        </p>
                    </header>

                    {error && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-mirai-text"
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
                                className="w-full rounded-lg border border-mirai-border bg-white px-4 py-3 text-mirai-text outline-none transition placeholder:text-stone-400 focus:border-mirai-primary focus:ring-3 focus:ring-mirai-primary-soft disabled:cursor-not-allowed disabled:bg-stone-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-mirai-text"
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
                                        password: event.target.value,
                                    })
                                }
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                required
                                disabled={isLoading}
                                className="w-full rounded-lg border border-mirai-border bg-white px-4 py-3 text-mirai-text outline-none transition placeholder:text-stone-400 focus:border-mirai-primary focus:ring-3 focus:ring-mirai-primary-soft disabled:cursor-not-allowed disabled:bg-stone-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-mirai-primary px-4 py-3 font-semibold text-white transition hover:bg-mirai-primary-dark focus:outline-none focus:ring-3 focus:ring-mirai-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading
                                ? 'Iniciando sesión...'
                                : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div className="mt-7 border-t border-mirai-border pt-6 text-center">
                        <p className="text-sm text-mirai-muted">
                            ¿Todavía no tienes una cuenta?
                        </p>

                        <Link
                            to="/register"
                            className="mt-2 inline-block text-sm font-semibold text-mirai-primary transition hover:text-mirai-primary-dark hover:underline"
                        >
                            Crear una cuenta
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}