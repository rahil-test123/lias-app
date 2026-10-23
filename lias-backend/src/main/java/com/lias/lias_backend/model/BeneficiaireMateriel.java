package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor
public class BeneficiaireMateriel {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=100) private String nom;
    @Column(nullable=false,length=100) private String prenom;
    @Column(length=200) private String service;
    @Column(unique=true) private Long membreId;
}
