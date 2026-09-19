package com.cibertec.backend.dto.auth;

import com.cibertec.backend.entity.Usuario;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        String rol,
        Boolean activo
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getActivo()
        );
    }
}
