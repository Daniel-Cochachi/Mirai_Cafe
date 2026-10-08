package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {

    List<Receta> findByProductoIdOrderByInsumoIdAsc(Long productoId);

    Optional<Receta> findByProductoIdAndInsumoId(Long productoId, Long insumoId);

    boolean existsByProductoIdAndInsumoId(Long productoId, Long insumoId);

    void deleteByProductoId(Long productoId);

}
