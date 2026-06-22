// Fichier : src/main/java/com/lias/lias_backend/repository/DocumentRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByMembreId(Long membreId, Pageable pageable);

    List<Document> findByEvenementId(Long evenementId);

    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.titre) LIKE LOWER(CONCAT('%',:terme,'%'))")
    List<Document> rechercherDocuments(String terme);
}