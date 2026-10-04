package com.cibertec.backend.service;

import com.cibertec.backend.dto.producto.ProductoRequest;
import com.cibertec.backend.entity.Categoria;
import com.cibertec.backend.entity.Producto;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.repository.CategoriaRepository;
import com.cibertec.backend.repository.ProductoRepository;
import com.cibertec.backend.specification.ProductoSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductoService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public List<Producto> buscarTodos() {
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));
    }

    public Producto guardar(ProductoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada."));

        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setImagenUrl(request.imagenUrl());
        producto.setDisponible(request.disponible());
        producto.setStock(request.stock());
        producto.setCategoria(categoria);

        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, ProductoRequest request) {
        Producto productoAntiguo = buscarPorId(id);

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada."));

        productoAntiguo.setNombre(request.nombre());
        productoAntiguo.setDescripcion(request.descripcion());
        productoAntiguo.setPrecio(request.precio());
        productoAntiguo.setImagenUrl(request.imagenUrl());
        productoAntiguo.setDisponible(request.disponible());
        productoAntiguo.setStock(request.stock());
        productoAntiguo.setCategoria(categoria);

        return productoRepository.save(productoAntiguo);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public Producto cambiarDisponibilidad(Long id, boolean disponibilidad) {
        Producto productoAntiguo = buscarPorId(id);
        productoAntiguo.setDisponible(disponibilidad);
        return productoRepository.save(productoAntiguo);
    }

    public List<Producto> buscarConFiltros(Long categoriaId, Boolean disponible, String texto) {
        log.info(">>> Consultando productos en la base de datos");
        Specification<Producto> spec = Specification
                .where(ProductoSpecifications.tieneCategoria(categoriaId))
                .and(ProductoSpecifications.estaDisponible(disponible))
                .and(ProductoSpecifications.contieneTexto(texto));

        return productoRepository.findAll(spec);
    }

}
