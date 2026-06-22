// Fichier : src/main/java/com/lias/lias_backend/dto/PublicationDTO.java
package com.lias.lias_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PublicationDTO {

    private Long id;

    @NotBlank(message = "Titre obligatoire")
    private String titre;

    @NotBlank(message = "Auteurs obligatoires")
    private String auteurs;

    @NotNull(message = "Année obligatoire")
    private Integer annee;

    @NotBlank(message = "Type obligatoire")
    private String type;

    private String lien;
    private Long membreId;
    private String membreNom;
    private Long equipeId;
    private String equipeNom;
}