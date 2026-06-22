// Fichier : src/main/java/com/lias/lias_backend/repository/HistoriqueActionRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.HistoriqueAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoriqueActionRepository extends JpaRepository<HistoriqueAction, Long> {

    Page<HistoriqueAction> findByMembreIdOrderByDateActionDesc(
        Long membreId, Pageable pageable);
}