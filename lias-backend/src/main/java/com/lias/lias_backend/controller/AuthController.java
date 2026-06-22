// Fichier : src/main/java/com/lias/lias_backend/controller/AuthController.java
package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.LoginRequest;
import com.lias.lias_backend.dto.LoginResponse;
import com.lias.lias_backend.dto.MembreCreateDTO;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Membre> register(
            @Valid @RequestBody MembreCreateDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }
}