package com.lias.lias_backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentDTO {
    private Long id;
    private String titre;
    private String type;
    private String cheminFichier;
    private LocalDateTime dateUpload;
    private Long evenementId;
    private String evenementTitre;
    private Long membreId;
    private String membreNom;
}
