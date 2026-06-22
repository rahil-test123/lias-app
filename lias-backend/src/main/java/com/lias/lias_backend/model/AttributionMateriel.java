// Fichier : src/main/java/com/lias/lias_backend/model/AttributionMateriel.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "attribution_materiel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributionMateriel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_materiel", nullable = false)
    private Materiel materiel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membre", nullable = false)
    private Membre membre;

    @Column(nullable = false)
    private Integer quantite = 1;

    @Column(name = "date_attribution", nullable = false)
    private LocalDate dateAttribution;
}