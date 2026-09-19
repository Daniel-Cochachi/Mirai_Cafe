package com.cibertec.backend.security;


import com.cibertec.backend.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
        this.expirationMs = expirationMs;
    }

    public String generarToken(Usuario usuario) {

        Date fechaActual = new Date();
        Date fechaExpiracion = new Date(
                fechaActual.getTime() + expirationMs
        );

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("rol", usuario.getRol().name())
                .claim("nombre", usuario.getNombre())
                .issuedAt(fechaActual)
                .expiration(fechaExpiracion)
                .signWith(secretKey)
                .compact();
    }

    public String extraerEmail(String token) {

        return obtenerClaims(token)
                .getSubject();
    }

    public boolean esValido(
            String token,
            Usuario usuario
    ) {
        String email = extraerEmail(token);

        return email.equals(usuario.getEmail())
                && !estaExpirado(token);
    }

    private boolean estaExpirado(String token) {

        return obtenerClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims obtenerClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
