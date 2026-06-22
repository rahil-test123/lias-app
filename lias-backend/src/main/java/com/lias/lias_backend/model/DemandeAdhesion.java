// Fichier : src/main/java/com/lias/lias_backend/model/DemandeAdhesion.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "demande_adhesion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeAdhesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 500)
    private String cv;

    @Column(columnDefinition = "TEXT")
    private String motivation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @CreationTimestamp
    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_directeur")
    private Membre directeur;

    public enum StatutDemande {
        EN_ATTENTE, ACCEPTEE, REFUSEE
    }
}