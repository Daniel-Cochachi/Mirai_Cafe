package com.cibertec.backend.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CrearPedidoRequest(

        @NotEmpty(message = "El pedido debe contener al menos un producto")
        List<@Valid ItemPedidoRequest> items,

        @Size(
                max = 255,
                message = "La observación no puede superar los 255 caracteres"
        )
        String observacion
) {
}
