// Fichier : src/main/java/com/lias/lias_backend/dto/MembreDTO.java
package com.lias.lias_backend.dto;

import com.lias.lias_backend.model.Membre;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MembreDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Membre.StatutMembre statut;
    private Membre.RoleMembre role;
    private String photo;
    private String biographie;
    private String centresInteret;
    private String etablissementOrigine;
    private String laboratoireOrigine;
    private LocalDate dateEmbauche;
    private LocalDate dateAffiliation;
    private boolean actif;
    private LocalDateTime createdAt;
}