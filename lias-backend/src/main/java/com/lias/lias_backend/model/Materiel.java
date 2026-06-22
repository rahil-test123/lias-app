// Fichier : src/main/java/com/lias/lias_backend/model/Materiel.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "materiel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Materiel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantite_total", nullable = false)
    private Integer quantiteTotal = 0;

    @Column(name = "date_arrivage")
    private LocalDate dateArrivage;
}