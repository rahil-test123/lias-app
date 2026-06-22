// Fichier : src/main/java/com/lias/lias_backend/model/Publication.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "publication")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String titre;

    @Column(nullable = false, length = 500)
    private String auteurs;

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 500)
    private String lien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membre", nullable = false)
    private Membre membre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipe")
    private Equipe equipe;
}