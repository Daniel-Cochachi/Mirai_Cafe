package com.cibertec.backend.service;

import com.cibertec.backend.dto.usuario.ActualizarUsuarioRequest;
import com.cibertec.backend.dto.usuario.CambiarEstadoRequest;
import com.cibertec.backend.dto.usuario.CambiarRolRequest;
import com.cibertec.backend.dto.usuario.CrearUsuarioRequest;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.exception.EmailYaRegistradoException;
import com.cibertec.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. Listar todos los usuarios
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // 2. Buscar usuario por ID
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // 3. Crear usuario administrativo (ADMIN puede crear CAJERO o ADMIN)
    @Transactional
    public Usuario crear(CrearUsuarioRequest request) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailYaRegistradoException("El email ya está registrado");
        }
        Usuario nuevoUsuario = Usuario.builder()
                .nombre(request.nombre().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .rol(request.rol())
                .activo(true)
                .build();
        return usuarioRepository.save(nuevoUsuario);
    }

    // 4. Actualizar datos básicos (nombre)
    @Transactional
    public Usuario actualizar(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setNombre(request.nombre().trim());
        return usuarioRepository.save(usuario);
    }

    // 5. Cambiar rol (ADMIN, CAJERO, CLIENTE)
    @Transactional
    public Usuario cambiarRol(Long id, CambiarRolRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setRol(request.rol());
        return usuarioRepository.save(usuario);
    }

    // 6. Activar o desactivar usuario (bloqueo lógico)
    @Transactional
    public Usuario cambiarEstado(Long id, CambiarEstadoRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(request.activo());
        return usuarioRepository.save(usuario);
    }
}
