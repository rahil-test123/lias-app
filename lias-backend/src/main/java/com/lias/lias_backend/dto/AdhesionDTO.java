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
    private String nom;

    @NotBlank(message = "Prénom obligatoire")
    private String prenom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    private String cv;
    private String motivation;
    private DemandeAdhesion.StatutDemande statut;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateDecision;
}