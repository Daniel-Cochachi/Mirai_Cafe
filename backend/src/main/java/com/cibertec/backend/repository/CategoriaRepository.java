package com.cibertec.backend.repository;

import com.cibertec.backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long > {
        boolean existsByNombre(String nombre);
}