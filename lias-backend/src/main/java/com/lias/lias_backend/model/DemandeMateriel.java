package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;
@Entity @Getter @Setter @NoArgsConstructor
public class DemandeMateriel {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long beneficiaireId;
    @Column(nullable=false) private Long materielId;
    @Column(nullable=false,length=200) private String categorie;
    @Column(nullable=false) private int quantite;
    @Column(nullable=false) private int priorite;
    @Column(nullable=false) private int necessite;
    private int critereSpecifique;
    @Column(length=2000) private String motif;
    @Column(nullable=false) private LocalDate dateDemande;
    @Column(nullable=false) private LocalDateTime creeLe;
    @Column(nullable=false) private String statut;
    private Integer rangManuel;
    @Column(length=2000) private String motifDecision;
    @Column(length=2000) private String motifOrdre;
    @Column(unique=true,length=100) private String cleOperation;
}
