package com.lias.lias_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttributionMaterielDTO {
    private Long id;

    @NotNull(message = "ID du matériel obligatoire")
    private Long materielId;

    private String materielNom;

    @NotNull(message = "ID du membre obligatoire")
    private Long membreId;

    private String membreNom;

    @NotNull(message = "Quantité obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    private LocalDate dateAttribution;
    private Integer quantiteDisponible;
}
