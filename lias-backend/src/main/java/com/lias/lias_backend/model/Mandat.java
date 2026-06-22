// Fichier : src/main/java/com/lias/lias_backend/model/Mandat.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "mandat")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mandat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membre", nullable = false)
    private Membre membre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleMandat role;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    public enum RoleMandat {
        DIRECTEUR, VICE_DIRECTEUR, CHEF_EQUIPE
    }
}