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
import com.cibertec.backend.dto.auth.ActualizarPerfilRequest;
import com.cibertec.backend.dto.auth.CambiarPasswordRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
        name = "Autenticación",
        description = "Registro, login y administración del perfil propio"
)
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Registrar cliente",
            description = """
                Registra un nuevo usuario con rol CLIENTE.
                No requiere autenticación.
                """
    )
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

    @Operation(
            summary = "Iniciar sesión",
            description = """
                Valida el correo y la contraseña.
                Devuelve un token JWT si las credenciales son correctas.
                """
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Consultar perfil propio",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(
                UsuarioResponse.from(usuario)
        );
    }

    @Operation(
            summary = "Actualizar perfil propio",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/me")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody ActualizarPerfilRequest request
    ) {
        Usuario usuarioActualizado = authService.actualizarPerfil(usuario.getId(), request);
        return ResponseEntity.ok(UsuarioResponse.from(usuarioActualizado));
    }

    @Operation(
            summary = "Cambiar contraseña",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/me/password")
    public ResponseEntity<Void> cambiarPassword(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody CambiarPasswordRequest request
    ) {
        authService.cambiarPassword(usuario.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
