package com.cibertec.backend.controller;



import com.cibertec.backend.dto.auth.RegistroRequest;
import com.cibertec.backend.dto.auth.UsuarioResponse;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.cibertec.backend.dto.auth.AuthResponse;
import com.cibertec.backend.dto.auth.LoginRequest;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    //register
    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody RegistroRequest request
    ) {
        Usuario usuario = authService.registrar(request);

        UsuarioResponse response = UsuarioResponse.from(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    //login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(
                UsuarioResponse.from(usuario)
        );
    }
}
