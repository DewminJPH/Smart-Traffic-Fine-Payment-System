package com.police.traffic.gateway.filter;

import com.police.traffic.gateway.config.JwtUtils;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtils jwtUtils;

    // List of public endpoints that don't require logging in
    private final List<String> publicEndpoints = List.of(
            "/api/v1/auth/login",
            "/api/v1/fines/search",
            "/api/v1/payments/pay"
    );

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();

        // 1. Bypass validation for public endpoints
        if (isPublicEndpoint(path, request.getMethod().name())) {
            return chain.filter(exchange);
        }

        // 2. Check for Authorization header
        if (!request.getHeaders().containsKey("Authorization")) {
            return onError(exchange, "No Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 3. Validate Token
        if (!jwtUtils.validateToken(token) || jwtUtils.isTokenExpired(token)) {
            return onError(exchange, "Invalid or Expired Token", HttpStatus.UNAUTHORIZED);
        }

        // 4. Extract claims and propagate downstream via Headers
        Claims claims = jwtUtils.getClaims(token);
        String username = claims.getSubject();
        String role = claims.get("role", String.class);

        // Enforce basic endpoint access controls directly in gateway for simplicity
        if (path.contains("/api/v1/admin/") && !"ADMIN".equals(role)) {
            return onError(exchange, "Forbidden: Admins only", HttpStatus.FORBIDDEN);
        }

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", username)
                .header("X-User-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicEndpoint(String path, String method) {
        // Direct login bypass
        if (path.equals("/api/v1/auth/login")) {
            return true;
        }
        // Public payment processing
        if (path.equals("/api/v1/payments/pay")) {
            return true;
        }
        // Public fine lookup: GET /api/v1/fines/{reference}
        if (path.startsWith("/api/v1/fines/") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        // Public category lookup: GET /api/v1/categories
        if (path.startsWith("/api/v1/categories") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        return false;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Run before other filters
    }
}
