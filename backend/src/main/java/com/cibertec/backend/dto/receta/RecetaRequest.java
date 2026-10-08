package com.cibertec.backend.dto.receta;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecetaRequest(
        @NotEmpty(message = "La receta debe tener al menos un insumo")
        List<RecetaItemRequest> items
) {
}
