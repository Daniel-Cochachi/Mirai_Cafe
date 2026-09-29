package com.cibertec.backend.controller;

import com.cibertec.backend.dto.producto.DisponibilidadRequest;
import com.cibertec.backend.dto.producto.ProductoRequest;
import com.cibertec.backend.dto.producto.ProductoResponse;
import com.cibertec.backend.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public List<ProductoResponse> listarTodos(@RequestParam(required = false) Long categoryId, @RequestParam(required = false) Boolean available, @RequestParam(required = false) String search) {
        return productoService.buscarConFiltros(categoryId, available,search).stream().map(ProductoResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ProductoResponse buscarPorId(@PathVariable Long id) {
        return ProductoResponse.from(productoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> guardar(@RequestBody @Valid ProductoRequest producto) {
        ProductoResponse nuevoProducto =  ProductoResponse.from(productoService.guardar(producto));
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @RequestBody @Valid ProductoRequest producto) {
        return ProductoResponse.from(productoService.actualizar(id, producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/availability")
    public ProductoResponse actualizarDisponibilidad(@PathVariable Long id, @RequestBody DisponibilidadRequest request) {
        return ProductoResponse.from(productoService.cambiarDisponibilidad(id, request.disponible()));
    }
}
