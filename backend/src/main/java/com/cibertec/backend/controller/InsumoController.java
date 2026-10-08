package com.cibertec.backend.controller;

import com.cibertec.backend.dto.insumo.InsumoActualizarRequest;
import com.cibertec.backend.dto.insumo.InsumoEstadoRequest;
import com.cibertec.backend.dto.insumo.InsumoRequest;
import com.cibertec.backend.dto.insumo.InsumoResponse;
import com.cibertec.backend.dto.movimiento.MovimientoResponse;
import com.cibertec.backend.service.InsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ingredients")
@PreAuthorize("hasRole('ADMIN')")
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping
    public List<InsumoResponse> listarTodas() {
        return insumoService.listarTodas().stream()
                .map(InsumoResponse::from)
                .toList();
    }

    @GetMapping("/low-stock")
    public List<InsumoResponse> listarStockBajo() {
        return insumoService.listarStockBajo().stream()
                .map(InsumoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public InsumoResponse buscarPorId(@PathVariable Long id) {
        return InsumoResponse.from(insumoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InsumoResponse> guardar(@Valid @RequestBody InsumoRequest request) {
        InsumoResponse respuesta = InsumoResponse.from(insumoService.crear(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PutMapping("/{id}")
    public InsumoResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody InsumoActualizarRequest request
    ) {
        return InsumoResponse.from(insumoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    public InsumoResponse cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody InsumoEstadoRequest request
    ) {
        return InsumoResponse.from(insumoService.cambiarEstado(id, request.activo()));
    }

    @GetMapping("/{id}/movements")
    public List<MovimientoResponse> listarMovimientos(@PathVariable Long id) {
        return insumoService.listarMovimientos(id).stream()
                .map(MovimientoResponse::from)
                .toList();
    }

}
