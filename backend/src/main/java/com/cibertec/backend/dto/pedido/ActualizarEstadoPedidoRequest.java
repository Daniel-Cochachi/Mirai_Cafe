package com.cibertec.backend.dto.pedido;

import com.cibertec.backend.entity.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoPedidoRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoPedido estado
) {
}
