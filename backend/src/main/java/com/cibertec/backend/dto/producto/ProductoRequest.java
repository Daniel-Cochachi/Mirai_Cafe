package com.cibertec.backend.dto.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor a 0")
        BigDecimal precio,

        String imagenUrl,

        boolean disponible,

        @PositiveOrZero(message = "El stock no puede ser negativo")
        int stock,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId
) {
}