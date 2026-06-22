// Fichier : src/main/java/com/lias/lias_backend/dto/RapportDTO.java
package com.lias.lias_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RapportDTO {

    private Integer annee;
    private long nbMembres;
    private long nbMembersPermanents;
    private long nbDoctorants;
    private long nbPublications;
    private long nbEvenements;
    private long nbConventionsActives;
    private long nbDemandesAdhesion;
    private long nbDemandesAcceptees;
    private List<PublicationDTO> topPublications;
    private List<EvenementDTO> evenements;
}