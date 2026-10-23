// Fichier : src/main/java/com/lias/lias_backend/repository/AttributionMaterielRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.AttributionMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributionMaterielRepository extends JpaRepository<AttributionMateriel, Long> {

    List<AttributionMateriel> findByMembreId(Long membreId);

    List<AttributionMateriel> findByMaterielId(Long materielId);

    java.util.Optional<AttributionMateriel> findByCleOperation(String cleOperation);
    @Query("SELECT SUM(a.quantite) FROM AttributionMateriel a WHERE a.materiel.id = :materielId AND a.annule = false")
    Integer getTotalAttribue(Long materielId);
}
