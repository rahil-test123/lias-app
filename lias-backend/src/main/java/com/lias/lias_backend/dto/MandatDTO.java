package com.lias.lias_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MandatDTO {
    private Long id;
    private Long membreId;
    private String membreNom;
    private String role;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
