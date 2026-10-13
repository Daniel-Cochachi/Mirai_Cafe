import {
    ArrowLeftRight,
    ChefHat,
    ExternalLink,
    LayoutDashboard,
    LayoutGrid,
    LogOut,
    Package,
    ShoppingBag,
    Tag,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { MiraiLogo } from '../../brand/MiraiLogo'

export type AdminTab =
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'ingredients'
    | 'movements'
    | 'recipes'

interface AdminSidebarProps {
    activeTab: AdminTab
    onTabChange: (tab: AdminTab) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const todosLosItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Pedidos y Ventas', icon: ShoppingBag },
        { id: 'products', label: 'Productos', icon: LayoutGrid },
        { id: 'categories', label: 'Categorías', icon: Tag },
        { id: 'ingredients', label: 'Insumos', icon: Package },
        { id: 'movements', label: 'Movimientos', icon: ArrowLeftRight },
        { id: 'recipes', label: 'Recetas', icon: ChefHat },
    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // El cajero solo ve el dashboard de ventas y los pedidos
    const tabsCajero: AdminTab[] = ['dashboard', 'orders']

    const menuItems =
        user?.rol === 'ADMIN'
            ? todosLosItems
            : todosLosItems.filter((item) => tabsCajero.includes(item.id))

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col justify-between border-r border-white/10 bg-[#0f0f10] p-5 text-white">
            {/* 1. Header con Logo Oficial de Mirai Café */}
            <div>
                <div className="flex items-center gap-3 px-2 py-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/60 shadow-md">
                        <MiraiLogo size={32} />
                    </span>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-white">
                            Mirai Café
                        </h2>
                        <span className="text-xs font-semibold text-amber-400">
                            Panel Administrativo
                        </span>
                    </div>
                </div>

                {/* 2. Lista de Navegación */}
                <nav className="mt-8 space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange(item.id)}
                                className={[
                                    'group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200',
                                    isActive
                                        ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                                        : 'text-white/55 hover:bg-white/5 hover:text-white',
                                ].join(' ')}
                            >
                                <Icon
                                    size={18}
                                    className={
                                        isActive
                                            ? 'text-amber-400'
                                            : 'text-white/40 transition group-hover:text-white'
                                    }
                                />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* 3. Footer del Sidebar */}
            <div className="space-y-2 border-t border-white/10 pt-4">
                {/* Perfil del usuario actual */}
                <div className="flex items-center gap-3 px-3 py-2 text-xs text-white/60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                        {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="truncate">
                        <p className="truncate font-semibold text-white">
                            {user?.nombre || 'Administrador'}
                        </p>
                        <p className="text-[10px] text-white/40">{user?.email}</p>
                    </div>
                </div>

                {/* Enlace para volver a la tienda web */}
                <Link
                    to="/menu"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600/20 px-3.5 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-600/30"
                >
                    <ExternalLink size={14} />
                    <span>Ver Catálogo Web</span>
                </Link>

                {/* Botón cerrar sesión */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-400/80 transition hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut size={15} />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    )
}
