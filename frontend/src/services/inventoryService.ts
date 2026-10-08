import api from './api'

import type {
    Movimiento,
    MovimientoRequest,
} from '../types/inventory'

export const inventoryService = {
    async getAll(): Promise<Movimiento[]> {
        const response = await api.get<Movimiento[]>(
            '/inventory/movements',
        )

        return response.data
    },

    async create(
        data: MovimientoRequest,
    ): Promise<Movimiento> {
        const response = await api.post<Movimiento>(
            '/inventory/movements',
            data,
        )

        return response.data
    },
}
