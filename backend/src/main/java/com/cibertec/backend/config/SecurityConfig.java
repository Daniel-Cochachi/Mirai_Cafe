package com.cibertec.backend.config;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.cibertec.backend.security.JwtAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {
                http
                                // 1. Habilitar CORS con nuestra configuración personalizada
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                (request, response, authException) -> {
                                                                        response.setStatus(
                                                                                        HttpServletResponse.SC_UNAUTHORIZED);
                                                                        response.setContentType(
                                                                                        "application/json");
                                                                        response.setCharacterEncoding("UTF-8");
                                                                        response.getWriter().write(
                                                                                        """
                                                                                                        {
                                                                                                          "status": 401,
                                                                                                          "message": "No autenticado"
                                                                                                        }
                                                                                                        """);
                                                                })
                                                .accessDeniedHandler(
                                                                (request, response, accessDeniedException) -> {
                                                                        response.setStatus(
                                                                                        HttpServletResponse.SC_FORBIDDEN);
                                                                        response.setContentType(
                                                                                        "application/json");
                                                                        response.setCharacterEncoding("UTF-8");
                                                                        response.getWriter().write(
                                                                                        """
                                                                                                        {
                                                                                                          "status": 403,
                                                                                                          "message": "No tienes permisos"
                                                                                                        }
                                                                                                        """);
                                                                }))
                                .authorizeHttpRequests(auth -> auth
                                                // Rutas públicas de autenticación
                                                // Swagger / OpenAPI
                                                .requestMatchers(
                                                        "/swagger-ui/**",
                                                        "/swagger-ui.html",
                                                        "/v3/api-docs/**"
                                                ).permitAll()

                                                .requestMatchers(
                                                                "/api/v1/auth/register",
                                                                "/api/v1/auth/login")
                                                .permitAll()
                                                // Endpoint de salud público
                                                .requestMatchers("/api/v1/health").permitAll()
                                                // Catálogo público: cualquier visitante puede ver productos y
                                                // categorías (solo lectura GET)
                                                .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                                                // Todo lo demás requiere autenticación
                                                .anyRequest().authenticated())
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        // Bean de configuración de CORS
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Permitir el origen del Frontend (Vite suele usar 5173, Create-React-App
                // suele usar 3000)
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "http://localhost:3000"
                ));
                // Métodos HTTP permitidos
                configuration.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
                ));
                // Encabezados permitidos (incluyendo Authorization para enviar el JWT)
                configuration.setAllowedHeaders(List.of(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With"
                ));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

}
