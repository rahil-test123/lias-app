// Fichier : src/main/java/com/lias/lias_backend/repository/DemandeAdhesionRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.DemandeAdhesion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {

    Page<DemandeAdhesion> findByStatut(
        DemandeAdhesion.StatutDemande statut, Pageable pageable);

    boolean existsByEmail(String email);

    long countByStatut(DemandeAdhesion.StatutDemande statut);
}