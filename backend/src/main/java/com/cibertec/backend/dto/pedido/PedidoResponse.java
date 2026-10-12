package com.cibertec.backend.dto.pedido;

import com.cibertec.backend.entity.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,

        Long usuarioId,

        String usuarioNombre,

        LocalDateTime fecha,

        BigDecimal total,

        EstadoPedido estado,

        String observacion,

        List<DetallePedidoResponse> detalles
) {
}
