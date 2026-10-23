// Fichier : src/main/java/com/lias/lias_backend/dto/AdhesionDTO.java
package com.lias.lias_backend.dto;

import com.lias.lias_backend.model.DemandeAdhesion;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdhesionDTO {

    private Long id;

    @NotBlank(message = "Nom obligatoire")
    @jakarta.validation.constraints.Size(max=100)
    private String nom;

    @NotBlank(message = "Prénom obligatoire")
    @jakarta.validation.constraints.Size(max=100)
    private String prenom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    @jakarta.validation.constraints.Size(max=150)
    private String email;

    private String cv;
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @jakarta.validation.constraints.Size(min=8, max=72, message="Le mot de passe doit contenir entre 8 et 72 caractères")
    private String password;
    @jakarta.validation.constraints.Size(max=5000)
    private String motivation;
    private DemandeAdhesion.StatutDemande statut;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateDecision;
}
