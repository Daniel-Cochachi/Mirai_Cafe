import api from './api'

import type {
    Insumo,
    InsumoRequest,
    InsumoUpdateRequest,
    Movimiento,
} from '../types/inventory'

export const ingredientService = {
    async getAll(): Promise<Insumo[]> {
        const response = await api.get<Insumo[]>(
            '/ingredients',
        )

        return response.data
    },

    async getLowStock(): Promise<Insumo[]> {
        const response = await api.get<Insumo[]>(
            '/ingredients/low-stock',
        )

        return response.data
    },

    async getById(id: number): Promise<Insumo> {
        const response = await api.get<Insumo>(
            `/ingredients/${id}`,
        )

        return response.data
    },

    async create(
        data: InsumoRequest,
    ): Promise<Insumo> {
        const response = await api.post<Insumo>(
            '/ingredients',
            data,
        )

        return response.data
    },

    async update(
        id: number,
        data: InsumoUpdateRequest,
    ): Promise<Insumo> {
        const response = await api.put<Insumo>(
            `/ingredients/${id}`,
            data,
        )

        return response.data
    },

    async updateStatus(
        id: number,
        activo: boolean,
    ): Promise<Insumo> {
        const response = await api.patch<Insumo>(
            `/ingredients/${id}/status`,
            { activo },
        )

        return response.data
    },

    async getMovements(id: number): Promise<Movimiento[]> {
        const response = await api.get<Movimiento[]>(
            `/ingredients/${id}/movements`,
        )

        return response.data
    },
}
