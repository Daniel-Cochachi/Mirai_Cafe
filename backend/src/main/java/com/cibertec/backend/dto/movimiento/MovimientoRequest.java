package com.cibertec.backend.dto.movimiento;

import com.cibertec.backend.entity.TipoMovimiento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record MovimientoRequest(
        @NotNull(message = "El insumo es obligatorio")
        Long insumoId,

        @NotNull(message = "El tipo de movimiento es obligatorio")
        TipoMovimiento tipo,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        BigDecimal cantidad,

        String observacion
) {
}
