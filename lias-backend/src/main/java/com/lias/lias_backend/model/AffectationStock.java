package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;
@Entity @Getter @Setter @NoArgsConstructor
@Table(indexes={@Index(name="idx_affectation_demande",columnList="demande_id"),@Index(name="idx_affectation_materiel",columnList="materiel_id")})
public class AffectationStock {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="demande_id",nullable=false) private Long demandeId;
    @Column(name="materiel_id",nullable=false) private Long materielId;
    @Column(nullable=false) private Long beneficiaireId;
    private String beneficiaireNom;
    private String service;
    private String materielNom;
    private String categorie;
    @Column(nullable=false) private int quantite;
    @Column(nullable=false) private LocalDateTime dateAffectation;
    private String administrateur;
    @Column(nullable=false) private String statut;
    @Column(length=2000) private String remarques;
    @Column(length=2000) private String motifAnnulation;
    private LocalDateTime dateAnnulation;
    @Column(unique=true,length=100) private String cleOperation;
}
