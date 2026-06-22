// Fichier : src/main/java/com/lias/lias_backend/repository/PublicationRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {

    Page<Publication> findByMembreId(Long membreId, Pageable pageable);

    Page<Publication> findByAnnee(Integer annee, Pageable pageable);

    Page<Publication> findByType(String type, Pageable pageable);

    Page<Publication> findByEquipeId(Long equipeId, Pageable pageable);

    List<Publication> findByAnnee(Integer annee);

    @Query("SELECT p FROM Publication p WHERE " +
           "LOWER(p.titre) LIKE LOWER(CONCAT('%',:terme,'%')) OR " +
           "LOWER(p.auteurs) LIKE LOWER(CONCAT('%',:terme,'%'))")
    List<Publication> rechercherPublications(String terme);

    long countByAnnee(Integer annee);
}