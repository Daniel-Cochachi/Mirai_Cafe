import type { ReactNode } from 'react'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar, type AdminTab } from './AdminSidebar'

interface AdminLayoutProps {
    activeTab: AdminTab
    onTabChange: (tab: AdminTab) => void
    onActionClick?: () => void
    children: ReactNode
}

export function AdminLayout({
    activeTab,
    onTabChange,
    onActionClick,
    children,
}: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-[#070708] text-white">
            {/* 1. Barra Lateral Fija */}
            <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />

            {/* 2. Área Principal (con margen izquierdo de 64 para no tapar el sidebar) */}
            <div className="flex min-h-screen flex-1 flex-col pl-64">
                {/* Cabecera Superior */}
                <AdminHeader activeTab={activeTab} onActionClick={onActionClick} />

                {/* Contenido Dinámico de la Pestaña Activa */}
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
