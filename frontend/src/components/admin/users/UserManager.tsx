import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Pencil,
    Plus,
    Power,
    Search,
    Shield,
    UserCheck,
    UserX,
    Users,
    X,
} from 'lucide-react'
import axios from 'axios'
import { userService } from '../../../services/userService'
import { useAuth } from '../../../context/AuthContext'
import { ConfirmModal } from '../common/ConfirmModal'
import type { ApiError } from '../../../types/auth'
import type {
    CreateUserRequest,
    UserItem,
    UserRole,
} from '../../../types/user'

const emptyCreateForm: CreateUserRequest = {
    nombre: '',
    email: '',
    password: '',
    rol: 'CAJERO',
}

export function UserManager() {
    const { user: currentUser } = useAuth()

    const [users, setUsers] = useState<UserItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

    // Filtros
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<'TODOS' | UserRole>('TODOS')
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS')

    // Modal Crear
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createForm, setCreateForm] = useState<CreateUserRequest>(emptyCreateForm)
    const [createError, setCreateError] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Modal Editar
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserItem | null>(null)
    const [editForm, setEditForm] = useState<{ nombre: string; rol: UserRole }>({
        nombre: '',
        rol: 'CLIENTE',
    })
    const [editError, setEditError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    // Modal Estado (Activar / Desactivar)
    const [userToToggleStatus, setUserToToggleStatus] = useState<UserItem | null>(null)
    const [isTogglingStatus, setIsTogglingStatus] = useState(false)

    // Cargar usuarios desde el backend
    const loadUsers = async () => {
        try {
            setIsLoading(true)
            setError('')
            const data = await userService.getAll()
            setUsers(data)
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setError(err.response?.data?.message || 'No fue posible cargar los usuarios.')
            } else {
                setError('Ocurrió un error inesperado al conectar con el servidor.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    // Conteo de administradores activos para no dejar al sistema sin Admin
    const activeAdminsCount = useMemo(() => {
        return users.filter((u) => u.rol === 'ADMIN' && u.activo).length
    }, [users])

    // Estadísticas para auditoría visual
    const stats = useMemo(() => {
        return {
            total: users.length,
            admins: users.filter((u) => u.rol === 'ADMIN').length,
            cajeros: users.filter((u) => u.rol === 'CAJERO').length,
            clientes: users.filter((u) => u.rol === 'CLIENTE').length,
            inactivos: users.filter((u) => !u.activo).length,
        }
    }, [users])

    // Filtros combinados (búsqueda + rol + estado)
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const query = searchQuery.trim().toLowerCase()
            const matchesQuery =
                !query ||
                u.nombre.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                String(u.id).includes(query)

            const matchesRole =
                selectedRoleFilter === 'TODOS' || u.rol === selectedRoleFilter

            const matchesStatus =
                selectedStatusFilter === 'TODOS' ||
                (selectedStatusFilter === 'ACTIVOS' && u.activo) ||
                (selectedStatusFilter === 'INACTIVOS' && !u.activo)

            return matchesQuery && matchesRole && matchesStatus
        })
    }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter])

    // --- ACCIONES DE CREACIÓN ---
    const handleOpenCreate = () => {
        setCreateForm(emptyCreateForm)
        setCreateError('')
        setShowPassword(false)
        setIsCreateOpen(true)
    }

    const handleCreateSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setCreateError('')

        // Sanitización y validaciones preventivas
        const nombreLimpio = createForm.nombre.trim()
        const emailLimpio = createForm.email.trim().toLowerCase()

        if (nombreLimpio.length < 2) {
            setCreateError('El nombre debe tener al menos 2 caracteres.')
            return
        }

        if (createForm.password.length < 8) {
            setCreateError('La contraseña debe tener como mínimo 8 caracteres.')
            return
        }

        setIsCreating(true)

        try {
            const nuevo = await userService.create({
                ...createForm,
                nombre: nombreLimpio,
                email: emailLimpio,
            })
            setIsCreateOpen(false)
            setFeedback({
                texto: `Usuario "${nuevo.nombre}" (${nuevo.rol}) creado exitosamente.`,
                tipo: 'exito',
            })
            await loadUsers()
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setCreateError(
                    err.response?.data?.message || 'Error al registrar el usuario. Revisa los datos ingresados.'
                )
            } else {
                setCreateError('Error de red o servidor no disponible.')
            }
        } finally {
            setIsCreating(false)
        }
    }

    // --- ACCIONES DE EDICIÓN ---
    const handleOpenEdit = (user: UserItem) => {
        setEditingUser(user)
        setEditForm({
            nombre: user.nombre,
            rol: user.rol,
        })
        setEditError('')
        setIsEditOpen(true)
    }

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!editingUser) return
        setEditError('')

        const nombreLimpio = editForm.nombre.trim()
        if (nombreLimpio.length < 2) {
            setEditError('El nombre debe tener al menos 2 caracteres.')
            return
        }

        // Regla: No degradar al último admin activo
        if (
            editingUser.rol === 'ADMIN' &&
            editForm.rol !== 'ADMIN' &&
            activeAdminsCount <= 1
        ) {
            setEditError('No puedes cambiar el rol al único Administrador activo del sistema.')
            return
        }

        setIsUpdating(true)

        try {
            let huboCambios = false

            if (nombreLimpio !== editingUser.nombre) {
                await userService.update(editingUser.id, { nombre: nombreLimpio })
                huboCambios = true
            }

            if (editForm.rol !== editingUser.rol) {
                await userService.changeRole(editingUser.id, { rol: editForm.rol })
                huboCambios = true
            }

            setIsEditOpen(false)
            setFeedback({
                texto: huboCambios
                    ? `Usuario "${editingUser.email}" actualizado correctamente.`
                    : 'No se realizaron modificaciones.',
                tipo: 'exito',
            })
            await loadUsers()
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setEditError(err.response?.data?.message || 'Error al actualizar el usuario.')
            } else {
                setEditError('Ocurrió un error inesperado al procesar la solicitud.')
            }
        } finally {
            setIsUpdating(false)
        }
    }

    // --- CAMBIO DE ESTADO (ACTIVAR / SUSPENDER) ---
    const handleIntentToggleStatus = (user: UserItem) => {
        // Validación 1: Auto-bloqueo
        if (currentUser?.id === user.id) {
            setFeedback({
                texto: 'Operación bloqueada: No puedes suspender tu propia cuenta activa.',
                tipo: 'error',
            })
            return
        }

        // Validación 2: Último administrador
        if (user.rol === 'ADMIN' && user.activo && activeAdminsCount <= 1) {
            setFeedback({
                texto: 'Seguridad: No se puede suspender al único Administrador activo del sistema.',
                tipo: 'error',
            })
            return
        }

        setUserToToggleStatus(user)
    }

    const handleConfirmToggleStatus = async () => {
        if (!userToToggleStatus) return
        setIsTogglingStatus(true)

        try {
            const nuevoEstado = !userToToggleStatus.activo
            await userService.changeStatus(userToToggleStatus.id, { activo: nuevoEstado })
            setFeedback({
                texto: `La cuenta de "${userToToggleStatus.nombre}" ahora está ${nuevoEstado ? 'ACTIVA' : 'SUSPENDIDA'
                    }.`,
                tipo: 'exito',
            })
            setUserToToggleStatus(null)
            await loadUsers()
        } catch (err) {
            if (axios.isAxiosError<ApiError>(err)) {
                setFeedback({
                    texto: err.response?.data?.message || 'No se pudo cambiar el estado de la cuenta.',
                    tipo: 'error',
                })
            }
            setUserToToggleStatus(null)
        } finally {
            setIsTogglingStatus(false)
        }
    }

    const getRoleBadge = (rol: UserRole) => {
        switch (rol) {
            case 'ADMIN':
                return 'border-purple-500/30 bg-purple-500/10 text-purple-300'
            case 'CAJERO':
                return 'border-sky-500/30 bg-sky-500/10 text-sky-300'
            case 'CLIENTE':
                return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
        }
    }

    return (
        <div className="space-y-6">
            {/* 1. Tarjetas de Auditoría y Resumen (KPIs) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-[#121215] p-4">
                    <div className="flex items-center justify-between text-white/40">
                        <span className="text-xs font-semibold">Total</span>
                        <Users size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-white">{stats.total}</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <div className="flex items-center justify-between text-purple-300/60">
                        <span className="text-xs font-semibold">Admins</span>
                        <Shield size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-purple-300">{stats.admins}</p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                    <div className="flex items-center justify-between text-sky-300/60">
                        <span className="text-xs font-semibold">Cajeros</span>
                        <UserCheck size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-sky-300">{stats.cajeros}</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center justify-between text-emerald-300/60">
                        <span className="text-xs font-semibold">Clientes</span>
                        <Users size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-emerald-300">{stats.clientes}</p>
                </div>

                <div className="col-span-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:col-span-1">
                    <div className="flex items-center justify-between text-rose-300/60">
                        <span className="text-xs font-semibold">Inactivos</span>
                        <UserX size={16} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-rose-300">{stats.inactivos}</p>
                </div>
            </div>

            {/* 2. Tarjeta Principal */}
            <div className="rounded-3xl border border-white/10 bg-[#121215] p-6 sm:p-9 shadow-xl">
                {/* Cabecera */}
                <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                            Módulo de Seguridad
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            Cuentas y Accesos
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                            Control estricto de roles administrativos y estados de cuenta
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-950/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>

                {/* Banner de Feedback */}
                {feedback && (
                    <div
                        className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${feedback.tipo === 'exito'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {feedback.tipo === 'exito' ? (
                                <CheckCircle2 size={16} />
                            ) : (
                                <AlertCircle size={16} />
                            )}
                            <span>{feedback.texto}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFeedback(null)}
                            className="p-1 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Barra de Filtros y Búsqueda */}
                <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por ID, nombre o correo electrónico..."
                            className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] pl-11 pr-10 text-sm text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filtro por Rol */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-[#16161a] p-1">
                            {(['TODOS', 'ADMIN', 'CAJERO', 'CLIENTE'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setSelectedRoleFilter(r)}
                                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${selectedRoleFilter === r
                                            ? 'bg-amber-500 text-black shadow-sm'
                                            : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Filtro por Estado */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-[#16161a] p-1">
                            {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as const).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedStatusFilter(s)}
                                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${selectedStatusFilter === s
                                            ? 'bg-white/20 text-white shadow-sm'
                                            : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Estado de Carga */}
                {isLoading && (
                    <div className="mt-7 space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="mt-7 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
                        {error}
                    </div>
                )}

                {/* Lista Vacía */}
                {!isLoading && !error && filteredUsers.length === 0 && (
                    <div className="py-14 text-center">
                        <Users size={32} className="mx-auto text-white/20" />
                        <p className="mt-3 text-sm font-medium text-white/40">
                            No se encontraron usuarios que coincidan con los filtros.
                        </p>
                    </div>
                )}

                {/* Tabla de Usuarios */}
                {!isLoading && !error && filteredUsers.length > 0 && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-[#18181c]/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-white">
                                <thead className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-white/50">
                                    <tr>
                                        <th className="px-5 py-3.5">Usuario</th>
                                        <th className="px-5 py-3.5">Email</th>
                                        <th className="px-5 py-3.5">Rol</th>
                                        <th className="px-5 py-3.5">Estado</th>
                                        <th className="px-5 py-3.5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((u) => {
                                        const isSelf = currentUser?.id === u.id
                                        const isLastAdmin = u.rol === 'ADMIN' && u.activo && activeAdminsCount <= 1

                                        return (
                                            <tr
                                                key={u.id}
                                                className="transition hover:bg-white/[0.02]"
                                            >
                                                {/* Nombre e inicial */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 font-bold text-amber-400">
                                                            {u.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-white">
                                                                    {u.nombre}
                                                                </span>
                                                                {isSelf && (
                                                                    <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                                                                        Tú
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-white/30">
                                                                ID: #{u.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Correo */}
                                                <td className="px-5 py-4 text-white/70">
                                                    {u.email}
                                                </td>

                                                {/* Badge de Rol */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${getRoleBadge(
                                                            u.rol
                                                        )}`}
                                                    >
                                                        <Shield size={12} />
                                                        {u.rol}
                                                    </span>
                                                </td>

                                                {/* Badge de Estado */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${u.activo
                                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${u.activo
                                                                    ? 'bg-emerald-400'
                                                                    : 'bg-rose-400'
                                                                }`}
                                                        />
                                                        {u.activo ? 'Activo' : 'Suspendido'}
                                                    </span>
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Editar */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(u)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-white/60 transition hover:bg-white/10 hover:text-white"
                                                            title="Editar datos y rol"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>

                                                        {/* Desactivar / Activar */}
                                                        <button
                                                            type="button"
                                                            disabled={isSelf || isLastAdmin}
                                                            onClick={() => handleIntentToggleStatus(u)}
                                                            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${isSelf || isLastAdmin
                                                                    ? 'cursor-not-allowed border-white/5 text-white/15'
                                                                    : u.activo
                                                                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                                                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                                }`}
                                                            title={
                                                                isSelf
                                                                    ? 'No puedes bloquear tu propia cuenta'
                                                                    : isLastAdmin
                                                                        ? 'No se puede desactivar al único Administrador'
                                                                        : u.activo
                                                                            ? 'Suspender acceso'
                                                                            : 'Reactivar acceso'
                                                            }
                                                        >
                                                            <Power size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL 1: Crear Usuario */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <h3 className="text-xl font-black text-white">Nuevo Usuario</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {createError && (
                            <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                                {createError}
                            </div>
                        )}

                        <form className="mt-6 space-y-4" onSubmit={handleCreateSubmit}>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-white/80">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    value={createForm.nombre}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, nombre: e.target.value })
                                    }
                                    placeholder="Ej. Rodrigo Torres"
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-white/80">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={createForm.email}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, email: e.target.value })
                                    }
                                    placeholder="rodrigo@mirai.com"
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-white/80">
                                    Contraseña Temporal * (mínimo 8 caracteres)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        maxLength={100}
                                        value={createForm.password}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, password: e.target.value })
                                        }
                                        placeholder="••••••••"
                                        className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] pl-4 pr-11 text-sm text-white placeholder-white/25 focus:border-amber-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-white/80">
                                    Rol en el Sistema
                                </label>
                                <select
                                    value={createForm.rol}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            rol: e.target.value as UserRole,
                                        })
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                >
                                    <option value="CAJERO">CAJERO (Ventas, Caja y Pedidos)</option>
                                    <option value="ADMIN">ADMIN (Acceso Total al Panel)</option>
                                    <option value="CLIENTE">CLIENTE (Solo Catálogo Web)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isCreating ? 'Registrando...' : 'Crear Usuario'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Editar Usuario */}
            {isEditOpen && editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/8 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-white">Editar Usuario</h3>
                                <p className="text-xs text-white/40">{editingUser.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="rounded-xl border border-white/10 bg-[#16161a] p-2 text-white/50 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {editError && (
                            <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                                {editError}
                            </div>
                        )}

                        <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-white/80">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    value={editForm.nombre}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, nombre: e.target.value })
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="block text-xs font-bold text-white/80">
                                        Rol Asignado
                                    </label>
                                    {currentUser?.id === editingUser.id && (
                                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                                            <Lock size={12} /> Tu propia cuenta
                                        </span>
                                    )}
                                </div>
                                <select
                                    disabled={currentUser?.id === editingUser.id}
                                    value={editForm.rol}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            rol: e.target.value as UserRole,
                                        })
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="CAJERO">CAJERO</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="CLIENTE">CLIENTE</option>
                                </select>
                                {currentUser?.id === editingUser.id && (
                                    <p className="mt-1 text-[11px] text-white/40">
                                        Por seguridad, no puedes degradar tu propio rol de Administrador.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                            >
                                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Confirmación para Activar / Desactivar */}
            <ConfirmModal
                isOpen={userToToggleStatus !== null}
                title={userToToggleStatus?.activo ? 'Suspender Acceso' : 'Reactivar Acceso'}
                message={
                    userToToggleStatus?.activo
                        ? `¿Estás seguro de suspender la cuenta de "${userToToggleStatus?.nombre}"? El usuario será bloqueado y no podrá iniciar sesión.`
                        : `¿Deseas reactivar el acceso de "${userToToggleStatus?.nombre}" al sistema?`
                }
                confirmText={
                    userToToggleStatus?.activo ? 'Sí, suspender cuenta' : 'Sí, reactivar cuenta'
                }
                cancelText="Cancelar"
                variant={userToToggleStatus?.activo ? 'danger' : 'success'}
                isLoading={isTogglingStatus}
                onConfirm={handleConfirmToggleStatus}
                onCancel={() => setUserToToggleStatus(null)}
            />
        </div>
    )
}
