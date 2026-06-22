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
    private String nom;

    private String description;

    @NotNull(message = "Quantité obligatoire")
    private Integer quantiteTotal;

    private Integer quantiteDisponible;

    private LocalDate dateArrivage;
}