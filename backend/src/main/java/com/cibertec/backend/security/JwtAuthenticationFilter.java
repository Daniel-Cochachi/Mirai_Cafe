package com.cibertec.backend.security;

import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.repository.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader(
                HttpHeaders.AUTHORIZATION
        );

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            String email = jwtService.extraerEmail(token);

            boolean sinAutenticacion =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null;

            if (email != null && sinAutenticacion) {

                usuarioRepository.findByEmail(email)
                        .filter(usuario ->
                                Boolean.TRUE.equals(usuario.getActivo())
                        )
                        .ifPresent(usuario ->
                                autenticarUsuario(
                                        usuario,
                                        token,
                                        request
                                )
                        );
            }

        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private void autenticarUsuario(
            Usuario usuario,
            String token,
            HttpServletRequest request
    ) {
        if (!jwtService.esValido(token, usuario)) {
            return;
        }

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(
                        "ROLE_" + usuario.getRol().name()
                );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        List.of(authority)
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);
    }
}
