package com.cibertec.backend.specification;

import com.cibertec.backend.entity.Producto;
import org.springframework.data.jpa.domain.Specification;

public class ProductoSpecifications {

    public static Specification<Producto> tieneCategoria(Long categoriaId) {
        return (root, query, cb) ->
                categoriaId == null ? null : cb.equal(root.get("categoria").get("id"), categoriaId);
    }

    public static Specification<Producto> estaDisponible(Boolean disponible) {
        return (root, query, cb) ->
                disponible == null ? null : cb.equal(root.get("disponible"), disponible);
    }

    public static Specification<Producto> contieneTexto(String texto) {
        return (root, query, cb) ->
                texto == null ? null : cb.like(cb.lower(root.get("nombre")), "%"+texto.toLowerCase()+"%");
    }

}