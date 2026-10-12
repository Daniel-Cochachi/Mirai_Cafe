package com.cibertec.backend.dto.pedido;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ItemPedidoRequest(
        @NotNull(message = "El producto es obligatorio")
        @Positive(message = "El ID del producto debe ser mayor a cero")
        Long productoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a cero")
        Integer cantidad
) {


}
