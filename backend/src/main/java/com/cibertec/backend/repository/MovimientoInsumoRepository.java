package com.cibertec.backend.repository;

import com.cibertec.backend.entity.MovimientoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MovimientoInsumoRepository extends JpaRepository<MovimientoInsumo, Long> {

    List<MovimientoInsumo> findByInsumoIdOrderByFechaDesc(Long insumoId);

    List<MovimientoInsumo> findAllByOrderByFechaDesc();

    @Modifying
    @Query("""
            UPDATE Insumo i
            SET i.stockActual = i.stockActual + :delta
            WHERE i.id = :id AND i.stockActual + :delta >= 0
            """)
    int modificarStock(@Param("id") Long id, @Param("delta") BigDecimal delta);

}
