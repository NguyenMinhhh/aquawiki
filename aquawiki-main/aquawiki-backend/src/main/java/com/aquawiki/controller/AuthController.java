package com.aquawiki.controller;

import com.aquawiki.dto.AuthResponse;
import com.aquawiki.dto.LoginRequest;
import com.aquawiki.dto.RegisterRequest;
import com.aquawiki.model.User;
import com.aquawiki.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "role", user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
