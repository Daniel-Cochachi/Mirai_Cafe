package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, Long id);

    @Query("SELECT i FROM Insumo i WHERE i.stockActual <= i.stockMinimo ORDER BY i.nombre")
    List<Insumo> buscarStockBajo();

}
