import api from './api'
import type {
    CrearPedidoRequest,
    EstadoPedido,
    OrderFilters,
    PedidoResponse,
} from '../types/order'

export const orderService = {
    // 1. Listado general para Admin y Cajero (con soporte de filtros de estado y rango de fechas)
    async getAll(filters?: OrderFilters): Promise<PedidoResponse[]> {
        const params: Record<string, string> = {}
        if (filters?.status) params.status = filters.status
        if (filters?.from) params.from = filters.from
        if (filters?.to) params.to = filters.to

        const response = await api.get<PedidoResponse[]>('/orders', { params })
        return response.data
    },

    // 2. Historial de pedidos del cliente autenticado
    async getMyOrders(): Promise<PedidoResponse[]> {
        try {
            const response = await api.get<PedidoResponse[]>('/orders/my-orders')
            return response.data
        } catch (error) {
            // Si el backend restringe /my-orders a rol CLIENTE (403), pero el usuario es ADMIN o CAJERO,
            // podemos obtener los pedidos desde /orders y filtrar por su propio usuarioId
            const stored = localStorage.getItem('auth_user')
            if (stored) {
                try {
                    const user = JSON.parse(stored)
                    if (user?.rol === 'ADMIN' || user?.rol === 'CAJERO') {
                        const allOrders = await api.get<PedidoResponse[]>('/orders')
                        return allOrders.data.filter((p) => p.usuarioId === user.id)
                    }
                } catch {
                    // Fall through
                }
            }
            throw error
        }
    },

    // 3. Detalle de pedido por ID
    async getById(id: number): Promise<PedidoResponse> {
        const response = await api.get<PedidoResponse>(`/orders/${id}`)
        return response.data
    },

    // 4. Crear un nuevo pedido (descuenta stock en base de datos)
    async create(data: CrearPedidoRequest): Promise<PedidoResponse> {
        const response = await api.post<PedidoResponse>('/orders', data)
        return response.data
    },

    // 5. Cambiar estado de la comanda (PENDIENTE -> EN_PROCESO -> LISTO)
    async updateStatus(id: number, estado: EstadoPedido): Promise<PedidoResponse> {
        const response = await api.patch<PedidoResponse>(`/orders/${id}/status`, { estado })
        return response.data
    },

    // 6. Confirmar pago (Marca como PAGADO)
    async pay(id: number): Promise<PedidoResponse> {
        const response = await api.post<PedidoResponse>(`/orders/${id}/pay`)
        return response.data
    },

    // 7. Cancelar pedido (Restituye automáticamente el stock de los productos)
    async cancel(id: number): Promise<PedidoResponse> {
        const response = await api.post<PedidoResponse>(`/orders/${id}/cancel`)
        return response.data
    },
}
