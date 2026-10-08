package com.cibertec.backend.dto.receta;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RecetaItemRequest(
        @NotNull(message = "El insumo es obligatorio")
        Long insumoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        BigDecimal cantidad
) {
}
