export type EstadoPedido =
    | 'PENDIENTE'
    | 'EN_PROCESO'
    | 'LISTO'
    | 'PAGADO'
    | 'CANCELADO'

export interface ItemPedidoRequest {
    productoId: number
    cantidad: number
}

export interface CrearPedidoRequest {
    items: ItemPedidoRequest[]
    observacion?: string
}

export interface DetallePedidoResponse {
    id: number
    productoId: number
    productoNombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
}

export interface PedidoResponse {
    id: number
    usuarioId: number
    usuarioNombre: string
    fecha: string
    total: number
    estado: EstadoPedido
    observacion?: string
    detalles: DetallePedidoResponse[]
}

export interface OrderFilters {
    status?: EstadoPedido
    from?: string // Formato YYYY-MM-DD
    to?: string   // Formato YYYY-MM-DD
}
