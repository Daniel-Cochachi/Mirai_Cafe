package com.cibertec.backend.dto.receta;

import java.util.List;

public record RecetaResponse(
        Long productoId,
        String productoNombre,
        List<RecetaItemResponse> items
) {
}
