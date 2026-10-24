package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Pedido;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long>, JpaSpecificationExecutor<Pedido> {

    // 1. Buscar pedido con usuario y productos (Spring Data ya tiene findById, solo le decimos que traiga los detalles)
    @Override
    @EntityGraph(attributePaths = {"usuario", "detalles", "detalles.producto"})
    Optional<Pedido> findById(Long id);

    // 2. Historial de un usuario por fecha (Spring Data genera el SQL automáticamente por el nombre)
    @EntityGraph(attributePaths = {"usuario", "detalles", "detalles.producto"})
    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    // 3. Listar con filtros dinámicos (Specification) para Admin y Cajero
    @Override
    @EntityGraph(attributePaths = {"usuario", "detalles", "detalles.producto"})
    List<Pedido> findAll(Specification<Pedido> spec, Sort sort);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> buscarPorIdConBloqueo(@Param("id") Long id);
}
