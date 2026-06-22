// Fichier : src/main/java/com/lias/lias_backend/dto/EvenementDTO.java
package com.lias.lias_backend.dto;

import com.lias.lias_backend.model.Evenement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EvenementDTO {

    private Long id;

    @NotBlank(message = "Titre obligatoire")
    private String titre;

    @NotNull(message = "Type obligatoire")
    private Evenement.TypeEvenement type;

    @NotNull(message = "Date de début obligatoire")
    private LocalDate dateDebut;

    private LocalDate dateFin;
    private String lieu;
    private String description;
    private Long organisateurId;
    private String organisateurNom;
}