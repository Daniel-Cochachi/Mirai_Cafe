package com.cibertec.backend.dto.usuario;

import com.cibertec.backend.entity.Rol;
import jakarta.validation.constraints.NotNull;

public record CambiarRolRequest(

        @NotNull(message = "El nuevo rol es obligatorio")
        Rol rol
) {
}
