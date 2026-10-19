import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import axios from 'axios'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'

import headerMenu from '../assets/header_menu.webp'
import { MiraiLogo } from '../components/brand/MiraiLogo'
import { authService } from '../services/authService'

import type {
    ApiError,
    RegisterRequest,
} from '../types/auth'

interface RegisterForm extends RegisterRequest {
    confirmPassword: string
}

export function RegisterPage() {
    const navigate = useNavigate()

    const [form, setForm] = useState<RegisterForm>({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const updateField = (
        field: keyof RegisterForm,
        value: string,
    ) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }))
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        setError('')

        const cleanNombre = form.nombre.trim()
        const cleanEmail = form.email.trim()

        if (cleanNombre.length < 2) {
            setError('El nombre debe tener al menos 2 caracteres.')
            return
        }

        if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            setError('Ingresa un correo electrónico válido.')
            return
        }

        if (form.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }


        setIsLoading(true)

        try {
            const registerRequest: RegisterRequest = {
                nombre: form.nombre.trim(),
                email: form.email.trim(),
                password: form.password,
            }

            await authService.register(registerRequest)

            navigate('/login', {
                replace: true,
            })
        } catch (requestError) {
            if (axios.isAxiosError<ApiError>(requestError)) {
                setError(
                    requestError.response?.data.message ??
                    'No fue posible crear la cuenta',
                )
            } else {
                setError('Ocurrió un error inesperado')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="grid min-h-screen bg-[#0a0a0a] lg:grid-cols-[0.9fr_1.1fr]">
            {/* Formulario */}
            <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
                <Link
                    to="/"
                    className="absolute left-5 top-6 inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-mirai-accent sm:left-10 sm:top-8"
                >
                    <ArrowLeft size={18} />
                    Volver
                </Link>

                <div className="w-full max-w-md">
                    {/* Marca */}
                    <Link
                        to="/"
                        className="mb-9 flex w-fit items-center gap-3"
                    >
                        <span className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-mirai-accent/35 bg-[#111111] text-mirai-accent shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                            <MiraiLogo size={27} />

                            <span className="-mt-1 text-[6px] font-bold tracking-[0.22em] text-mirai-accent/75">
                                MIRAI
                            </span>
                        </span>

                        <div>
                            <p className="text-lg font-bold text-white">
                                Mirai Café
                            </p>

                            <p className="mt-0.5 text-xs text-white/45">
                                Fresco y delicioso
                            </p>
                        </div>
                    </Link>

                    {/* Encabezado */}
                    <header>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mirai-accent">
                            Nueva cuenta
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                            Crea tu cuenta
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                            Regístrate para acceder a tus pedidos y
                            disfrutar de Mirai Café.
                        </p>
                    </header>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                        >
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form
                        className="mt-7 space-y-4"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label
                                htmlFor="nombre"
                                className="mb-2 block text-sm font-semibold text-white/75"
                            >
                                Nombre completo
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                value={form.nombre}
                                onChange={(event) =>
                                    updateField(
                                        'nombre',
                                        event.target.value,
                                    )
                                }
                                placeholder="Ingresa tu nombre"
                                autoComplete="name"
                                minLength={2}
                                maxLength={100}
                                required
                                disabled={isLoading}
                                className="h-12 w-full rounded-xl border border-white/10 bg-[#151515] px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

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
                                value={form.email}
                                onChange={(event) =>
                                    updateField(
                                        'email',
                                        event.target.value,
                                    )
                                }
                                placeholder="usuario@example.com"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                                className="h-12 w-full rounded-xl border border-white/10 bg-[#151515] px-4 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Contraseña
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(event) =>
                                            updateField(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
                                        minLength={8}
                                        maxLength={100}
                                        required
                                        disabled={isLoading}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#151515] pl-4 pr-11 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {form.password.length > 0 && (
                                    <p className={`mt-1.5 flex items-center gap-1 text-[11px] ${form.password.length >= 8 ? 'text-green-400' : 'text-amber-400'}`}>
                                        {form.password.length >= 8 ? (
                                            <>
                                                <Check size={12} />
                                                Mínimo 8 caracteres cumplido
                                            </>
                                        ) : (
                                            `Faltan ${8 - form.password.length} caracteres`
                                        )}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-white/75"
                                >
                                    Confirmar
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={form.confirmPassword}
                                        onChange={(event) =>
                                            updateField(
                                                'confirmPassword',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Repite la contraseña"
                                        autoComplete="new-password"
                                        minLength={8}
                                        maxLength={100}
                                        required
                                        disabled={isLoading}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#151515] pl-4 pr-11 text-white outline-none transition placeholder:text-white/25 focus:border-mirai-accent focus:ring-3 focus:ring-mirai-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {form.confirmPassword.length > 0 && (
                                    <p className={`mt-1.5 flex items-center gap-1 text-[11px] ${form.password === form.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {form.password === form.confirmPassword ? (
                                            <>
                                                <Check size={12} />
                                                Las contraseñas coinciden
                                            </>
                                        ) : (
                                            'Las contraseñas no coinciden'
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-mirai-accent px-5 font-semibold text-white transition hover:bg-mirai-accent-dark focus:outline-none focus:ring-3 focus:ring-mirai-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading
                                ? 'Creando cuenta...'
                                : 'Crear cuenta'}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-white/8 pt-5 text-center">
                        <p className="text-sm text-white/40">
                            ¿Ya tienes una cuenta?
                        </p>

                        <Link
                            to="/login"
                            className="mt-2 inline-block text-sm font-semibold text-mirai-accent transition hover:text-white"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </section>

            {/* Imagen */}
            <section className="relative hidden min-h-screen overflow-hidden lg:block">
                <img
                    src={headerMenu}
                    alt="Café servido en Mirai Café"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

                <div className="absolute bottom-12 right-12 z-10 max-w-lg text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-mirai-accent">
                        Bienvenido a Mirai Café
                    </p>

                    <h2 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                        Hay un momento especial esperándote.
                    </h2>

                    <p className="ml-auto mt-4 max-w-md text-sm leading-6 text-white/55">
                        Crea tu cuenta y mantén tus pedidos y datos
                        organizados en un solo lugar.
                    </p>
                </div>
            </section>
        </main>
    )
}