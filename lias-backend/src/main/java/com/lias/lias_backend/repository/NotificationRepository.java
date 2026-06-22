// Fichier : src/main/java/com/lias/lias_backend/repository/NotificationRepository.java
package com.lias.lias_backend.repository;

import com.lias.lias_backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByMembreIdAndLuFalseOrderByDateCreationDesc(Long membreId);

    List<Notification> findByMembreIdOrderByDateCreationDesc(Long membreId);

    long countByMembreIdAndLuFalse(Long membreId);
}