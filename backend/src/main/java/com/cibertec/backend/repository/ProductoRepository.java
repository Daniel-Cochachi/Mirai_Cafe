package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Producto;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long >, JpaSpecificationExecutor<Producto> {

    boolean existsByCategoriaId(Long categoriaId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT p
        FROM Producto p
        WHERE p.id = :productoId
        """)
    Optional<Producto> buscarPorIdConBloqueo(
            @Param("productoId") Long productoId
    );
}
