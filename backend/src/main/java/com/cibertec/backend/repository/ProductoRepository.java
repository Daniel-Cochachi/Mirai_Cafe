package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Producto;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long > {

    boolean existsByCategoriaId(Long categoriaId);

}
