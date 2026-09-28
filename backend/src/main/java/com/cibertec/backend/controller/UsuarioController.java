package com.cibertec.backend.controller;

import com.cibertec.backend.dto.auth.UsuarioResponse;
import com.cibertec.backend.dto.usuario.ActualizarUsuarioRequest;
import com.cibertec.backend.dto.usuario.CambiarEstadoRequest;
import com.cibertec.backend.dto.usuario.CambiarRolRequest;
import com.cibertec.backend.dto.usuario.CrearUsuarioRequest;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;


    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        List<UsuarioResponse> response = usuarioService.listarTodos()
                .stream()
                .map(UsuarioResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    // 2. Consultar usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    // 3. Crear usuario administrativo
    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody CrearUsuarioRequest request
    ) {
        Usuario nuevoUsuario = usuarioService.crear(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UsuarioResponse.from(nuevoUsuario));
    }

    // 4. Actualizar usuario (nombre)
    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request
    ) {
        Usuario usuarioActualizado = usuarioService.actualizar(id, request);
        return ResponseEntity.ok(UsuarioResponse.from(usuarioActualizado));
    }

    // 5. Cambiar rol
    @PatchMapping("/{id}/role")
    public ResponseEntity<UsuarioResponse> cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody CambiarRolRequest request
    ) {
        Usuario usuarioActualizado = usuarioService.cambiarRol(id, request);
        return ResponseEntity.ok(UsuarioResponse.from(usuarioActualizado));
    }

    // 6. Activar o desactivar usuario
    @PatchMapping("/{id}/status")
    public ResponseEntity<UsuarioResponse> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoRequest request
    ) {
        Usuario usuarioActualizado = usuarioService.cambiarEstado(id, request);
        return ResponseEntity.ok(UsuarioResponse.from(usuarioActualizado));
    }
}
