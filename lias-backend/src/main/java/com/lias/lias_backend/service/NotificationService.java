// Fichier : src/main/java/com/lias/lias_backend/service/NotificationService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.model.Notification;
import com.lias.lias_backend.repository.MembreRepository;
import com.lias.lias_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MembreRepository membreRepository;

    public List<Notification> getAllNotifications(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Membre non trouvé: " + email));
        return notificationRepository.findByMembreIdOrderByDateCreationDesc(membre.getId());
    }

    public List<Notification> getMesNotifications(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));
        return notificationRepository
                .findByMembreIdAndLuFalseOrderByDateCreationDesc(membre.getId());
    }

    public long countNonLues(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));
        return notificationRepository.countByMembreIdAndLuFalse(membre.getId());
    }

    @Transactional
    public void marquerCommeLue(Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification", id));
        notif.setLu(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void marquerToutesLues(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Membre non trouvé: " + email));
        List<Notification> nonLues = notificationRepository
                .findByMembreIdAndLuFalseOrderByDateCreationDesc(membre.getId());
        nonLues.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(nonLues);
        log.info("Toutes les notifications marquées comme lues pour: {}", email);
    }

    @Transactional
    public void creerNotification(Long membreId, String message) {
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre", membreId));
        Notification notif = Notification.builder()
                .membre(membre)
                .message(message)
                .lu(false)
                .build();
        notificationRepository.save(notif);
        log.info("Notification créée pour membre {}: {}", membreId, message);
    }
}