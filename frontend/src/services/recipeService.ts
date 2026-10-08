import api from './api'

import type {
    Receta,
    RecetaItemRequest,
} from '../types/inventory'

export const recipeService = {
    async getByProduct(productId: number): Promise<Receta> {
        const response = await api.get<Receta>(
            `/products/${productId}/recipe`,
        )

        return response.data
    },

    async addItem(
        productId: number,
        data: RecetaItemRequest,
    ): Promise<Receta> {
        const response = await api.post<Receta>(
            `/products/${productId}/recipe`,
            data,
        )

        return response.data
    },

    async replace(
        productId: number,
        data: { items: RecetaItemRequest[] },
    ): Promise<Receta> {
        const response = await api.put<Receta>(
            `/products/${productId}/recipe`,
            data,
        )

        return response.data
    },

    async removeItem(
        productId: number,
        insumoId: number,
    ): Promise<void> {
        await api.delete(
            `/products/${productId}/recipe/${insumoId}`,
        )
    },
}
