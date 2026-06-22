// Fichier : src/main/java/com/lias/lias_backend/model/Membre.java
package com.lias.lias_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "membre")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutMembre statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleMembre role;

    @Column(length = 255)
    private String photo;

    @Column(columnDefinition = "TEXT")
    private String biographie;

    @Column(name = "centres_interet", columnDefinition = "TEXT")
    private String centresInteret;

    @Column(name = "etablissement_origine", length = 200)
    private String etablissementOrigine;

    @Column(name = "laboratoire_origine", length = 200)
    private String laboratoireOrigine;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    @Column(name = "date_affiliation")
    private LocalDate dateAffiliation;

    @Column(nullable = false)
    private boolean actif = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enum statut
    public enum StatutMembre {
        PERMANENT, ASSOCIE, DOCTORANT, RETRAITE, ANCIEN
    }

    // Enum rôle
    public enum RoleMembre {
        ROLE_ADMIN, ROLE_DIRECTEUR, ROLE_MEMBRE, ROLE_DOCTORANT
    }
}