import type { AdminTab } from './AdminSidebar'

interface AdminHeaderProps {
    activeTab: AdminTab
    onActionClick?: () => void
}

export function AdminHeader({ activeTab, onActionClick }: AdminHeaderProps) {
    // Títulos y etiquetas según la pestaña activa
    const tabConfig: Record<AdminTab, { title: string; subtitle: string; actionLabel?: string }> = {
        dashboard: {
            title: 'Dashboard General',
            subtitle: 'Resumen ejecutivo y métricas en tiempo real',
            actionLabel: '+ Nuevo Pedido',
        },
        orders: {
            title: 'Pedidos y Ventas',
            subtitle: 'Control de estados, caja y pedidos entrantes',
            actionLabel: '+ Crear Pedido',
        },
        products: {
            title: 'Carta de Productos',
            subtitle: 'Gestión de precios, fotos y disponibilidad',
            actionLabel: '+ Nuevo Producto',
        },
        categories: {
            title: 'Categorías del Menú',
            subtitle: 'Clasificación de comidas, bebidas y postres',
            actionLabel: '+ Nueva Categoría',
        },
        ingredients: {
            title: 'Inventario de Insumos',
            subtitle: 'Existencias de materia prima y alertas de stock mínimo',
            actionLabel: '+ Nuevo Insumo',
        },
        movements: {
            title: 'Movimientos de Stock',
            subtitle: 'Auditoría de compras, entradas y salidas por merma',
            actionLabel: '+ Registrar Movimiento',
        },
        recipes: {
            title: 'Formulación de Recetas',
            subtitle: 'Relación de ingredientes requeridos por producto',
            actionLabel: '+ Configurar Receta',
        },
    }

    const currentConfig = tabConfig[activeTab]

    // Formatear la fecha en español: ej. "Lunes, 12 de octubre de 2026"
    const hoy = new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const fechaTexto = hoy.charAt(0).toUpperCase() + hoy.slice(1)

    return (
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 bg-[#0a0a0b]/80 px-8 py-6 backdrop-blur-md sm:flex-row sm:items-center">
            {/* Título y Fecha */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {currentConfig.title}
                </h1>
                <p className="mt-1 text-xs font-medium capitalize text-white/45">
                    {fechaTexto} • <span className="normal-case">{currentConfig.subtitle}</span>
                </p>
            </div>

            {/* Botón de Acción Rápida (como el "+ Nuevo Cliente" de la foto) */}
            {currentConfig.actionLabel && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onActionClick}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-900/40 active:scale-95"
                    >
                        <span>{currentConfig.actionLabel}</span>
                    </button>
                </div>
            )}
        </header>
    )
}
