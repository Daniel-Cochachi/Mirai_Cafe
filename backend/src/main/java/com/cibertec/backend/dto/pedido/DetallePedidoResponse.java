package com.cibertec.backend.dto.pedido;

import java.math.BigDecimal;

public record DetallePedidoResponse(
        Long id,

        Long productoId,

        String productoNombre,

        Integer cantidad,

        BigDecimal precioUnitario,

        BigDecimal subtotal
) {
}
