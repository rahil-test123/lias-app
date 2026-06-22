// Fichier : src/main/java/com/lias/lias_backend/repository/MaterielRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Materiel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterielRepository extends JpaRepository<Materiel, Long> {

    List<Materiel> findByNomContainingIgnoreCase(String nom);
}