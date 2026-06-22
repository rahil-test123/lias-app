// Fichier : src/main/java/com/lias/lias_backend/repository/EvenementRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Evenement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {

    Page<Evenement> findByType(Evenement.TypeEvenement type, Pageable pageable);

    List<Evenement> findByDateDebutBetween(LocalDate debut, LocalDate fin);

    @Query("SELECT e FROM Evenement e WHERE e.dateDebut >= :today ORDER BY e.dateDebut ASC")
    List<Evenement> findEvenementsAVenir(LocalDate today);

    @Query("SELECT e FROM Evenement e WHERE " +
           "LOWER(e.titre) LIKE LOWER(CONCAT('%',:terme,'%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%',:terme,'%'))")
    List<Evenement> rechercherEvenements(String terme);

    long countByDateDebutBetween(LocalDate debut, LocalDate fin);
}