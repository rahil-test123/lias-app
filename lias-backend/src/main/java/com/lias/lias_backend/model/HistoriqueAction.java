// Fichier : src/main/java/com/lias/lias_backend/model/HistoriqueAction.java
package com.lias.lias_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_action")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_membre", nullable = false)
    private Membre membre;

    @Column(nullable = false, length = 500)
    private String action;

    @CreationTimestamp
    @Column(name = "date_action")
    private LocalDateTime dateAction;

    @Column(columnDefinition = "TEXT")
    private String details;
}