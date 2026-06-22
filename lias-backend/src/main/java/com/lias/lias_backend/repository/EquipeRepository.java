// Fichier : src/main/java/com/lias/lias_backend/repository/EquipeRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {

    boolean existsByNom(String nom);

    List<Equipe> findByNomContainingIgnoreCase(String nom);
}