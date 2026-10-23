package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;
@Entity @Getter @Setter @NoArgsConstructor
public class ReceptionMateriel {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private Long materielId;
    private String materielNom;
    private String categorie;
    private int quantite;
    private LocalDate dateReception;
    private LocalDateTime creeLe;
    private String administrateur;
    @Column(length=2000) private String remarques;
    @Column(unique=true,length=100) private String cleOperation;
}
