package com.cibertec.backend.service;

import com.cibertec.backend.dto.auth.RegistroRequest;
import com.cibertec.backend.entity.Rol;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.exception.EmailYaRegistradoException;
import com.cibertec.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cibertec.backend.dto.auth.AuthResponse;
import com.cibertec.backend.dto.auth.LoginRequest;
import com.cibertec.backend.exception.CredencialesInvalidasException;
import com.cibertec.backend.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //register
    @Transactional
    public Usuario registrar(RegistroRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase();

        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailYaRegistradoException(
                    "El email ya está registrado"
            );
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.nombre().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .rol(Rol.CLIENTE)
                .activo(true)
                .build();

        return usuarioRepository.save(usuario);
    }

    //login
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase();

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new CredencialesInvalidasException(
                                "Email o contraseña incorrectos"
                        )
                );

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new CredencialesInvalidasException(
                    "Email o contraseña incorrectos"
            );
        }

        boolean passwordCorrecto = passwordEncoder.matches(
                request.password(),
                usuario.getPassword()
        );

        if (!passwordCorrecto) {
            throw new CredencialesInvalidasException(
                    "Email o contraseña incorrectos"
            );
        }

        String token = jwtService.generarToken(usuario);

        return new AuthResponse(
                token,
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
}
