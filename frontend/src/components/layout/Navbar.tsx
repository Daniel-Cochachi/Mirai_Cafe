import { useState } from 'react'

import {
    LayoutDashboard,
    LogOut,
    Menu,
    ShoppingBag,
    UserRound,
    X,
} from 'lucide-react'

import {
    Link,
    NavLink,
    useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { MiraiLogo } from '../brand/MiraiLogo'

export function Navbar() {
    const navigate = useNavigate()

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth()

    const { totalItems, openCart } = useCart()

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const handleLogout = () => {
        logout()
        closeMenu()
        navigate('/')
    }

    const navLinkClass = ({
        isActive,
    }: {
        isActive: boolean
    }) => {
        const baseClass =
            'rounded-lg px-3 py-2 text-sm font-medium transition'

        if (isActive) {
            return `${baseClass} bg-white/10 text-white`
        }

        return `${baseClass} text-white/60 hover:bg-white/10 hover:text-white`
    }

    return (
        <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/85 to-transparent text-white">
            <nav className="flex h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24">
                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3"
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

                {/* Navegación de escritorio */}
                <div className="hidden items-center gap-1 md:flex">
                    <NavLink
                        to="/"
                        end
                        className={navLinkClass}
                    >
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/menu"
                        className={navLinkClass}
                    >
                        Menú
                    </NavLink>

                    {isAuthenticated && (
                        <NavLink
                            to="/mis-pedidos"
                            className={navLinkClass}
                        >
                            Mis pedidos
                        </NavLink>
                    )}
                </div>

                {/* Acciones de escritorio */}
                <div className="hidden items-center gap-3 md:flex">
                    {/* Botón Carrito de Compras */}
                    <button
                        type="button"
                        onClick={openCart}
                        className="relative flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-white transition hover:border-amber-400/40 hover:bg-white/10 active:scale-95"
                        aria-label="Ver pedido en curso"
                    >
                        <ShoppingBag size={17} className="text-amber-400" />
                        <span>Pedido</span>
                        {totalItems > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-black shadow-md shadow-amber-500/30">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <>
                            {(user?.rol === 'ADMIN' || user?.rol === 'CAJERO') && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
                                >
                                    <LayoutDashboard size={17} />

                                    Administración
                                </Link>
                            )}

                            <Link
                                to="/perfil"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                                <UserRound size={18} />

                                {user?.nombre ?? 'Mi cuenta'}
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Cerrar sesión"
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white/55 transition hover:bg-red-500/15 hover:text-red-300"
                            >
                                <LogOut size={19} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                            >
                                Iniciar sesión
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg bg-mirai-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* Acciones móviles (Carrito + Hamburguesa) */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        onClick={openCart}
                        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-amber-400 transition hover:bg-white/10"
                        aria-label="Ver comanda"
                    >
                        <ShoppingBag size={19} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-black">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* Botón del menú móvil */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={
                            isMenuOpen
                                ? 'Cerrar menú'
                                : 'Abrir menú'
                        }
                        aria-expanded={isMenuOpen}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-white transition hover:bg-white/10"
                    >
                        {isMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>
                </div>
            </nav>

            {/* Navegación móvil */}
            {isMenuOpen && (
                <div className="border-t border-white/10 bg-mirai-primary-dark/95 px-4 py-4 backdrop-blur md:hidden">
                    <div className="flex w-full flex-col gap-2">
                        <NavLink
                            to="/"
                            end
                            onClick={closeMenu}
                            className={navLinkClass}
                        >
                            Inicio
                        </NavLink>

                        <NavLink
                            to="/menu"
                            onClick={closeMenu}
                            className={navLinkClass}
                        >
                            Menú
                        </NavLink>

                        {isAuthenticated && (
                            <NavLink
                                to="/mis-pedidos"
                                onClick={closeMenu}
                                className={navLinkClass}
                            >
                                Mis pedidos
                            </NavLink>
                        )}

                        <div className="my-2 border-t border-white/10" />

                        {isAuthenticated ? (
                            <>
                                {(user?.rol === 'ADMIN' || user?.rol === 'CAJERO') && (
                                    <NavLink
                                        to="/admin"
                                        onClick={closeMenu}
                                        className={navLinkClass}
                                    >
                                        Administración
                                    </NavLink>
                                )}

                                <NavLink
                                    to="/perfil"
                                    onClick={closeMenu}
                                    className={navLinkClass}
                                >
                                    {user?.nombre ?? 'Mi cuenta'}
                                </NavLink>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                                >
                                    <LogOut size={18} />

                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    onClick={closeMenu}
                                    className={navLinkClass}
                                >
                                    Iniciar sesión
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    onClick={closeMenu}
                                    className="rounded-lg bg-mirai-accent px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-mirai-accent-dark"
                                >
                                    Registrarse
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}