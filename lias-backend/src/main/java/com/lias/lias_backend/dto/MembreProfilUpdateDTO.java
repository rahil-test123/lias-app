// Fichier : src/main/java/com/lias/lias_backend/dto/MembreProfilUpdateDTO.java
package com.lias.lias_backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembreProfilUpdateDTO {

    @Size(max = 100, message = "Nom trop long")
    private String nom;

    @Size(max = 100, message = "Prénom trop long")
    private String prenom;

    private String biographie;
    private String centresInteret;
    private String etablissementOrigine;
    private String laboratoireOrigine;
}