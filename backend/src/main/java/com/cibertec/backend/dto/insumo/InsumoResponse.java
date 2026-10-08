package com.cibertec.backend.dto.insumo;

import com.cibertec.backend.entity.Insumo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InsumoResponse(
        Long id,
        String nombre,
        String unidad,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        boolean activo,
        boolean stockBajo,
        LocalDateTime fechaIngreso
) {
    public static InsumoResponse from(Insumo insumo) {
        return new InsumoResponse(
                insumo.getId(),
                insumo.getNombre(),
                insumo.getUnidad(),
                insumo.getStockActual(),
                insumo.getStockMinimo(),
                insumo.isActivo(),
                insumo.getStockActual().compareTo(insumo.getStockMinimo()) <= 0,
                insumo.getFechaIngreso()
        );
    }

}
