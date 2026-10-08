package com.cibertec.backend.controller;

import com.cibertec.backend.dto.receta.RecetaItemRequest;
import com.cibertec.backend.dto.receta.RecetaItemResponse;
import com.cibertec.backend.dto.receta.RecetaRequest;
import com.cibertec.backend.dto.receta.RecetaResponse;
import com.cibertec.backend.entity.Producto;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.repository.ProductoRepository;
import com.cibertec.backend.service.RecetaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products/{productId}/recipe")
@PreAuthorize("hasRole('ADMIN')")
public class RecetaController {

    private final RecetaService recetaService;
    private final ProductoRepository productoRepository;

    @GetMapping
    public RecetaResponse listar(@PathVariable Long productId) {
        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));

        List<RecetaItemResponse> items = recetaService.listarPorProducto(productId).stream()
                .map(RecetaItemResponse::from)
                .toList();

        return new RecetaResponse(producto.getId(), producto.getNombre(), items);
    }

    @PostMapping
    public ResponseEntity<RecetaResponse> agregar(
            @PathVariable Long productId,
            @Valid @RequestBody RecetaItemRequest request
    ) {
        List<RecetaItemResponse> items = recetaService.agregar(productId, request).stream()
                .map(RecetaItemResponse::from)
                .toList();

        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RecetaResponse(producto.getId(), producto.getNombre(), items));
    }

    @PutMapping
    public RecetaResponse reemplazar(
            @PathVariable Long productId,
            @Valid @RequestBody RecetaRequest request
    ) {
        List<RecetaItemResponse> items = recetaService.reemplazar(productId, request).stream()
                .map(RecetaItemResponse::from)
                .toList();

        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));

        return new RecetaResponse(producto.getId(), producto.getNombre(), items);
    }

    @DeleteMapping("/{insumoId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long productId,
            @PathVariable Long insumoId
    ) {
        recetaService.eliminar(productId, insumoId);
        return ResponseEntity.noContent().build();
    }

}
