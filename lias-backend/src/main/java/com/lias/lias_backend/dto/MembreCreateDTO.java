// Fichier : src/main/java/com/lias/lias_backend/dto/MembreCreateDTO.java
package com.lias.lias_backend.dto;

import com.lias.lias_backend.model.Membre;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembreCreateDTO {

    @NotBlank(message = "Nom obligatoire")
    @Size(max = 100)
    private String nom;

    @NotBlank(message = "Prénom obligatoire")
    @Size(max = 100)
    private String prenom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 8, message = "Mot de passe minimum 8 caractères")
    private String password;

    private Membre.StatutMembre statut;
    private Membre.RoleMembre role;
}