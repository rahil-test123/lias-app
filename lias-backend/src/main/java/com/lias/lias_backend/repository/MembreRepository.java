// Fichier : src/main/java/com/lias/lias_backend/repository/MembreRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Membre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembreRepository extends JpaRepository<Membre, Long> {

    Optional<Membre> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Membre> findByActifTrue();

    List<Membre> findByStatut(Membre.StatutMembre statut);

    List<Membre> findByRoleIn(List<Membre.RoleMembre> roles);

    @Query("SELECT m FROM Membre m WHERE m.actif = true AND " +
           "(LOWER(m.nom) LIKE LOWER(CONCAT('%',:terme,'%')) OR " +
           "LOWER(m.prenom) LIKE LOWER(CONCAT('%',:terme,'%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%',:terme,'%')))")
    List<Membre> rechercherMembres(String terme);
}