// Fichier : src/main/java/com/lias/lias_backend/dto/MaterielDTO.java
package com.lias.lias_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaterielDTO {

    private Long id;

    @NotBlank(message = "Nom obligatoire")
    @jakarta.validation.constraints.Size(max=200)
    private String nom;

    @jakarta.validation.constraints.Size(max=2000) private String description;
    @jakarta.validation.constraints.Size(max=100) private String categorie;
    @jakarta.validation.constraints.Size(max=100) private String etat;
    @jakarta.validation.constraints.Size(max=2000) private String remarques;
    private boolean archive;

    @NotNull(message = "Quantité obligatoire")
    @jakarta.validation.constraints.Min(0)
    private Integer quantiteTotal;

    private Integer quantiteDisponible;

    private LocalDate dateArrivage;
}
