package com.lias.lias_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoriqueDTO {
    private Long id;
    private String action;
    private String details;
    private LocalDateTime dateAction;
    private Long membreId;
    private String membreNom;
}
