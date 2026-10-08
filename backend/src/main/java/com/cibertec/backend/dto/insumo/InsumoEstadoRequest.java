package com.cibertec.backend.dto.insumo;

import jakarta.validation.constraints.NotNull;

public record InsumoEstadoRequest(
        @NotNull(message = "El estado es obligatorio")
        Boolean activo
) {
}
