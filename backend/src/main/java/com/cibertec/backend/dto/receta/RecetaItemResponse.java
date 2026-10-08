package com.cibertec.backend.dto.receta;

import com.cibertec.backend.entity.Receta;

import java.math.BigDecimal;

public record RecetaItemResponse(
        Long insumoId,
        String insumoNombre,
        String unidad,
        BigDecimal cantidad
) {
    public static RecetaItemResponse from(Receta receta) {
        return new RecetaItemResponse(
                receta.getInsumo().getId(),
                receta.getInsumo().getNombre(),
                receta.getInsumo().getUnidad(),
                receta.getCantidad()
        );
    }

}
