package com.cibertec.backend.dto.producto;

import com.cibertec.backend.entity.Producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String imagenUrl,
        boolean disponible,
        int stock,
        Long categoriaId,
        String categoriaNombre,
        LocalDateTime fechaCreacion
) {
    public static ProductoResponse from(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getImagenUrl(),
                producto.isDisponible(),
                producto.getStock(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getFechaCreacion()
        );
    }
}