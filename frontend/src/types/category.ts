export interface Category {
    id: number
    nombre: string
    descripcion: string | null
}

export interface CategoryRequest {
    nombre: string
    descripcion?: string
}