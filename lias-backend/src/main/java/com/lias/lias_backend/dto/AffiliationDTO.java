package com.lias.lias_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AffiliationDTO {
    private Long id;
    private Long membreId;
    private String membreNom;
    private String membreEmail;
    private String membreStatut;
    private Long equipeId;
    private String equipeNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
