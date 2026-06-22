// Fichier : src/main/java/com/lias/lias_backend/repository/MandatRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Mandat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MandatRepository extends JpaRepository<Mandat, Long> {

    // Directeur actif (mandat en cours)
    @Query("SELECT m FROM Mandat m WHERE m.role = 'DIRECTEUR' AND m.dateFin IS NULL")
    Optional<Mandat> findDirecteurActif();

    // Mandat actif d'un membre
    @Query("SELECT m FROM Mandat m WHERE m.membre.id = :membreId AND m.dateFin IS NULL")
    Optional<Mandat> findMandatActifByMembre(Long membreId);
}