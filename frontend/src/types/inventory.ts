export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

export type UnidadInsumo = 'kg' | 'litros' | 'unidades'

export interface Insumo {
    id: number
    nombre: string
    unidad: string
    stockActual: number
    stockMinimo: number
    activo: boolean
    stockBajo: boolean
    fechaIngreso: string | null
}

export interface InsumoRequest {
    nombre: string
    unidad: string
    stockMinimo: number
    stockInicial: number
}

export interface InsumoUpdateRequest {
    nombre: string
    unidad: string
    stockMinimo: number
}

export interface Movimiento {
    id: number
    insumoId: number
    insumoNombre: string
    tipo: TipoMovimiento
    cantidad: number
    fecha: string
    observacion: string | null
}

export interface MovimientoRequest {
    insumoId: number
    tipo: TipoMovimiento
    cantidad: number
    observacion?: string
}

export interface RecetaItem {
    insumoId: number
    insumoNombre: string
    unidad: string
    cantidad: number
}

export interface Receta {
    productoId: number
    productoNombre: string
    items: RecetaItem[]
}

export interface RecetaItemRequest {
    insumoId: number
    cantidad: number
}
