package com.police.traffic.auth.controller;

import com.police.traffic.auth.config.JwtTokenProvider;
import com.police.traffic.auth.model.User;
import com.police.traffic.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public record LoginRequest(String username, String password) {}
    public record LoginResponse(String token, String username, String role) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        return userRepository.findById(loginRequest.username())
                .map(user -> {
                    if (passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
                        String role = user.getRole().getName();
                        String token = tokenProvider.generateToken(user.getId(), role);
                        return ResponseEntity.ok(new LoginResponse(token, user.getId(), role));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password"));
    }
}
