// Fichier : src/main/java/com/lias/lias_backend/repository/MaterielRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Materiel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterielRepository extends JpaRepository<Materiel, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select m from Materiel m where m.id = :id")
    java.util.Optional<Materiel> verrouiller(Long id);

    List<Materiel> findByNomContainingIgnoreCase(String nom);
}
