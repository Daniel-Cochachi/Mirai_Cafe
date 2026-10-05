export interface Product {
    id: number
    nombre: string
    descripcion: string | null
    precio: number
    imagenUrl: string | null
    disponible: boolean
    stock: number
    categoriaId: number
    categoriaNombre: string
    fechaCreacion: string
}

export interface ProductFilters {
    categoryId?: number
    available?: boolean
    search?: string
}

export interface ProductRequest {
    nombre: string
    descripcion?: string
    precio: number
    imagenUrl?: string | null
    disponible: boolean
    stock: number
    categoriaId: number
}