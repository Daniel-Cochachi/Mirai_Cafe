package com.cibertec.backend.dto.auth;

public record AuthResponse(
        String token,
        Long id,
        String nombre,
        String email,
        String rol
) {

}
