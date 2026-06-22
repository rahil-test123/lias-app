// Fichier : src/main/java/com/lias/lias_backend/repository/AffiliationRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Affiliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffiliationRepository extends JpaRepository<Affiliation, Long> {

    List<Affiliation> findByMembreId(Long membreId);

    List<Affiliation> findByEquipeId(Long equipeId);

    // Affiliation active (dateFin IS NULL)
    @Query("SELECT a FROM Affiliation a WHERE a.membre.id = :membreId AND a.dateFin IS NULL")
    Optional<Affiliation> findAffiliationActive(Long membreId);

    // Membres actifs d'une équipe
    @Query("SELECT a FROM Affiliation a WHERE a.equipe.id = :equipeId AND a.dateFin IS NULL")
    List<Affiliation> findMembresActifsByEquipe(Long equipeId);
}