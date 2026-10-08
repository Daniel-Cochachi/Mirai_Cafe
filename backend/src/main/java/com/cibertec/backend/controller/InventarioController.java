package com.cibertec.backend.controller;

import com.cibertec.backend.dto.movimiento.MovimientoRequest;
import com.cibertec.backend.dto.movimiento.MovimientoResponse;
import com.cibertec.backend.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/inventory/movements")
@PreAuthorize("hasRole('ADMIN')")
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public List<MovimientoResponse> listarMovimientos() {
        return inventarioService.listarMovimientos().stream()
                .map(MovimientoResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<MovimientoResponse> registrar(
            @Valid @RequestBody MovimientoRequest request
    ) {
        MovimientoResponse respuesta = MovimientoResponse.from(inventarioService.registrar(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

}
