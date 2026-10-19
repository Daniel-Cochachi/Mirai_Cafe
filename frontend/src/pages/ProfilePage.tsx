import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'

import {
    Check,
    Eye,
    EyeOff,
    KeyRound,
    LayoutDashboard,
    Lock,
    LogOut,
    Mail,
    Pencil,
    ShieldCheck,
    UserRound,
    X,
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

interface ToastNotification {
    type: 'success' | 'error'
    message: string
}

export function ProfilePage() {
    const navigate = useNavigate()

    const {
        isAuthenticated,
        logout,
        updateUser,
    } = useAuth()

    const [profile, setProfile] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // Toast state
    const [toast, setToast] = useState<ToastNotification | null>(null)

    // Modal states
    const [isEditNameOpen, setIsEditNameOpen] = useState(false)
    const [editNameValue, setEditNameValue] = useState('')
    const [isSavingName, setIsSavingName] = useState(false)
    const [editNameError, setEditNameError] = useState('')

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(timer)
    }, [toast])

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
                const data = await authService.getProfile()

                if (isMounted) {
                    setProfile(data)
                    setEditNameValue(data.nombre)
                }
            } catch (requestError) {
                if (!isMounted) return

                if (
                    axios.isAxiosError<ApiError>(requestError) &&
                    requestError.response?.status === 401
                ) {
                    logout()
                    navigate('/login', {
                        replace: true,
                    })
                    return
                }

                setError('No fue posible cargar tu perfil.')
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
    }, [isAuthenticated, logout, navigate])

    // Handler: Update Name
    const handleOpenEditName = () => {
        if (profile) {
            setEditNameValue(profile.nombre)
        }
        setEditNameError('')
        setIsEditNameOpen(true)
    }

    const handleSaveName = async (e: FormEvent) => {
        e.preventDefault()
        const cleanName = editNameValue.trim()

        if (cleanName.length < 2) {
            setEditNameError('El nombre debe tener al menos 2 caracteres.')
            return
        }

        if (cleanName === profile?.nombre) {
            setIsEditNameOpen(false)
            return
        }

        setIsSavingName(true)
        setEditNameError('')

        try {
            const updated = await authService.updateProfile({ nombre: cleanName })
            setProfile(updated)
            updateUser({ nombre: updated.nombre })
            setIsEditNameOpen(false)
            setToast({
                type: 'success',
                message: 'Tu nombre ha sido actualizado correctamente.',
            })
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setEditNameError(
                    err.response?.data?.message || 'Error al actualizar el nombre.'
                )
            } else {
                setEditNameError('Ocurrió un error inesperado al actualizar.')
            }
        } finally {
            setIsSavingName(false)
        }
    }

    // Handler: Change Password
    const handleOpenChangePassword = () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmNewPassword(false)
        setPasswordError('')
        setIsChangePasswordOpen(true)
    }

    const handleSavePassword = async (e: FormEvent) => {
        e.preventDefault()
        setPasswordError('')

        if (!currentPassword) {
            setPasswordError('Por favor ingresa tu contraseña actual.')
            return
        }

        if (newPassword.length < 8) {
            setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.')
            return
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError('Las nuevas contraseñas no coinciden.')
            return
        }

        if (newPassword === currentPassword) {
            setPasswordError('La nueva contraseña no puede ser idéntica a la contraseña actual.')
            return
        }

        setIsSavingPassword(true)

        try {
            await authService.changePassword({
                passwordActual: currentPassword,
                passwordNuevo: newPassword,
            })

            setIsChangePasswordOpen(false)
            setToast({
                type: 'success',
                message: 'Contraseña actualizada exitosamente.',
            })
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                // If 401, the current password was wrong
                if (err.response?.status === 401) {
                    setPasswordError('La contraseña actual ingresada es incorrecta.')
                } else {
                    setPasswordError(
                        err.response?.data?.message || 'No fue posible cambiar la contraseña.'
                    )
                }
            } else {
                setPasswordError('Ocurrió un error inesperado al cambiar la contraseña.')
            }
        } finally {
            setIsSavingPassword(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    const initial =
        profile?.nombre
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() || 'M'

    const isStaff = profile?.rol === 'ADMIN' || profile?.rol === 'CAJERO'

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                    {/* Encabezado */}
                    <header className="border-b border-white/10 pb-9">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-mirai-accent">
                                    Mi cuenta
                                </p>
                                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                                    Mi perfil
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-white/45">
                                    Gestiona tus datos personales y la seguridad de tu cuenta.
                                </p>
                            </div>

                            {isStaff && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-2 rounded-xl border border-mirai-accent/30 bg-mirai-accent/10 px-4 py-3 text-sm font-semibold text-mirai-accent transition hover:bg-mirai-accent hover:text-white"
                                >
                                    <LayoutDashboard size={18} />
                                    Panel de Administración
                                </button>
                            )}
                        </div>
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
                            {/* Resumen lateral */}
                            <aside className="space-y-6">
                                <div className="rounded-3xl border border-white/10 bg-[#151515] p-7">
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
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20',
                                            ].join(' ')}
                                        >
                                            {profile.activo
                                                ? 'Cuenta activa'
                                                : 'Cuenta inactiva'}
                                        </span>
                                    </div>

                                    {/* Acciones Rápidas */}
                                    <div className="mt-6 space-y-2 border-t border-white/8 pt-6">
                                        <button
                                            onClick={handleOpenEditName}
                                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <Pencil size={16} className="text-mirai-accent" />
                                            Editar nombre
                                        </button>

                                        <button
                                            onClick={handleOpenChangePassword}
                                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <KeyRound size={16} className="text-mirai-accent" />
                                            Cambiar contraseña
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                        >
                                            <LogOut size={16} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            </aside>

                            {/* Información detallada */}
                            <section className="space-y-6">
                                <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
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
                                        {/* Nombre con botón de edición */}
                                        <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                                            <div className="flex items-center justify-between text-mirai-accent">
                                                <div className="flex items-center gap-2">
                                                    <UserRound size={17} strokeWidth={1.8} />
                                                    <p className="text-xs font-bold uppercase tracking-[0.14em]">
                                                        Nombre
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={handleOpenEditName}
                                                    className="inline-flex items-center gap-1 text-xs text-mirai-accent hover:underline cursor-pointer"
                                                >
                                                    <Pencil size={12} />
                                                    Editar
                                                </button>
                                            </div>

                                            <p className="mt-3 break-words text-sm font-semibold text-white/85">
                                                {profile.nombre}
                                            </p>
                                        </div>

                                        {/* Correo electrónico */}
                                        <ProfileField
                                            icon={Mail}
                                            label="Correo electrónico"
                                            value={profile.email}
                                        />

                                        {/* Tipo de cuenta */}
                                        <ProfileField
                                            icon={ShieldCheck}
                                            label="Tipo de cuenta"
                                            value={getRoleName(profile.rol)}
                                            className="sm:col-span-2"
                                        />
                                    </div>
                                </div>

                                {/* Tarjeta de Seguridad y Contraseña */}
                                <div className="rounded-3xl border border-white/10 bg-[#151515] p-7 sm:p-9">
                                    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-6">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mirai-accent">
                                                Seguridad
                                            </p>
                                            <h2 className="mt-2 text-2xl font-bold text-white">
                                                Contraseña y Acceso
                                            </h2>
                                        </div>

                                        <Lock
                                            size={27}
                                            className="text-white/20"
                                        />
                                    </div>

                                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-black/20 p-5">
                                        <div>
                                            <p className="text-sm font-semibold text-white/85">
                                                Contraseña de acceso
                                            </p>
                                            <p className="mt-1 text-xs text-white/45">
                                                Protege tu cuenta actualizando periódicamente tu contraseña.
                                            </p>
                                            <p className="mt-2 font-mono text-sm tracking-widest text-white/40">
                                                ••••••••••••
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleOpenChangePassword}
                                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-mirai-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                                        >
                                            <KeyRound size={16} />
                                            Actualizar Contraseña
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal: Editar Nombre */}
            {isEditNameOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-6 shadow-2xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-bold text-white">Editar Nombre</h3>
                            <button
                                onClick={() => setIsEditNameOpen(false)}
                                className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {editNameError && (
                            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
                                {editNameError}
                            </div>
                        )}

                        <form onSubmit={handleSaveName} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    placeholder="Ingresa tu nombre"
                                    minLength={2}
                                    maxLength={100}
                                    required
                                    disabled={isSavingName}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 text-sm text-white outline-none focus:border-mirai-accent focus:ring-2 focus:ring-mirai-accent/20"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditNameOpen(false)}
                                    disabled={isSavingName}
                                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingName}
                                    className="rounded-xl bg-mirai-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mirai-accent-dark disabled:opacity-50"
                                >
                                    {isSavingName ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Cambiar Contraseña */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-6 shadow-2xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
                            <button
                                onClick={() => setIsChangePasswordOpen(false)}
                                className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handleSavePassword} className="mt-6 space-y-4">
                            {/* Contraseña Actual */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Ingresa tu contraseña actual"
                                        required
                                        disabled={isSavingPassword}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#1c1c1c] pl-4 pr-11 text-sm text-white outline-none focus:border-mirai-accent focus:ring-2 focus:ring-mirai-accent/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Nueva Contraseña */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        minLength={8}
                                        required
                                        disabled={isSavingPassword}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#1c1c1c] pl-4 pr-11 text-sm text-white outline-none focus:border-mirai-accent focus:ring-2 focus:ring-mirai-accent/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && (
                                    <p className={`mt-1.5 flex items-center gap-1 text-[11px] ${newPassword.length >= 8 ? 'text-green-400' : 'text-amber-400'}`}>
                                        {newPassword.length >= 8 ? (
                                            <>
                                                <Check size={12} />
                                                Mínimo 8 caracteres cumplido
                                            </>
                                        ) : (
                                            `Faltan ${8 - newPassword.length} caracteres`
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Confirmar Nueva Contraseña */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                                    Confirmar Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmNewPassword ? 'text' : 'password'}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Repite la nueva contraseña"
                                        minLength={8}
                                        required
                                        disabled={isSavingPassword}
                                        className="h-12 w-full rounded-xl border border-white/10 bg-[#1c1c1c] pl-4 pr-11 text-sm text-white outline-none focus:border-mirai-accent focus:ring-2 focus:ring-mirai-accent/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                                    >
                                        {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmNewPassword.length > 0 && (
                                    <p className={`mt-1.5 flex items-center gap-1 text-[11px] ${newPassword === confirmNewPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {newPassword === confirmNewPassword ? (
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

                            <div className="mt-6 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    disabled={isSavingPassword}
                                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="rounded-xl bg-mirai-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mirai-accent-dark disabled:opacity-50"
                                >
                                    {isSavingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toast Notification */}
            {toast && (
                <div
                    role="alert"
                    className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${
                        toast.type === 'success'
                            ? 'border-green-500/30 bg-green-950/80 text-green-200'
                            : 'border-red-500/30 bg-red-950/80 text-red-200'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                            <Check size={16} />
                        </div>
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                            <X size={16} />
                        </div>
                    )}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 text-white/40 hover:text-white"
                        aria-label="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

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