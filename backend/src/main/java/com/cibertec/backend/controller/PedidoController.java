package com.cibertec.backend.controller;

import com.cibertec.backend.dto.pedido.ActualizarEstadoPedidoRequest;
import com.cibertec.backend.dto.pedido.CrearPedidoRequest;
import com.cibertec.backend.dto.pedido.PedidoResponse;
import com.cibertec.backend.entity.EstadoPedido;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENTE', 'CAJERO')")
    public ResponseEntity<PedidoResponse> crearPedido(
            @Valid @RequestBody CrearPedidoRequest request,
            @AuthenticationPrincipal Usuario usuario
    ) {
        PedidoResponse pedido = pedidoService.crearPedido(
                usuario.getEmail(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pedido);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<PedidoResponse>> listarMisPedidos(
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(pedidoService.listarMisPedidos(usuario.getId()));
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<List<PedidoResponse>> listarTodos(
            @RequestParam(required = false) EstadoPedido status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(pedidoService.listarTodos(status, from, to));
    }
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponse> obtenerPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id, usuario));
    }
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, request.estado()));
    }
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(pedidoService.cancelarPedido(id, usuario));
    }
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJERO')")
    public ResponseEntity<PedidoResponse> pagarPedido(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pedidoService.pagarPedido(id));
    }


}
