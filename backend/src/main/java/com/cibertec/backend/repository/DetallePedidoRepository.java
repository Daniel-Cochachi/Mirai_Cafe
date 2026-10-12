package com.cibertec.backend.repository;

import com.cibertec.backend.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, Long> {
}