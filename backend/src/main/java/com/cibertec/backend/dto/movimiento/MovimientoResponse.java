package com.cibertec.backend.dto.movimiento;

import com.cibertec.backend.entity.MovimientoInsumo;
import com.cibertec.backend.entity.TipoMovimiento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimientoResponse(
        Long id,
        Long insumoId,
        String insumoNombre,
        TipoMovimiento tipo,
        BigDecimal cantidad,
        LocalDateTime fecha,
        String observacion
) {
    public static MovimientoResponse from(MovimientoInsumo movimiento) {
        return new MovimientoResponse(
                movimiento.getId(),
                movimiento.getInsumo().getId(),
                movimiento.getInsumo().getNombre(),
                movimiento.getTipo(),
                movimiento.getCantidad(),
                movimiento.getFecha(),
                movimiento.getObservacion()
        );
    }

}
