package com.lias.lias_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class EquipeDTO {
    private Long id;
    private String nom;
    private String description;
    private LocalDate dateCreation;
    private int nbMembres;
    private List<AffiliationDTO> membres;
    private List<MandatDTO> mandats;
}
