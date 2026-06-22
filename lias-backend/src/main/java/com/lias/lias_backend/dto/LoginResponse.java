// Fichier : src/main/java/com/lias/lias_backend/dto/LoginResponse.java
package com.lias.lias_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    private String statut;
    private Long id;
}