// Fichier : src/main/java/com/lias/lias_backend/service/AdhesionService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.AdhesionDTO;
import com.lias.lias_backend.dto.MembreCreateDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.DemandeAdhesion;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.model.Notification;
import com.lias.lias_backend.repository.DemandeAdhesionRepository;
import com.lias.lias_backend.repository.MandatRepository;
import com.lias.lias_backend.repository.MembreRepository;
import com.lias.lias_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdhesionService {

    private final DemandeAdhesionRepository adhesionRepository;
    private final MembreRepository membreRepository;
    private final MandatRepository mandatRepository;
    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    @Transactional
    public AdhesionDTO soumettre(AdhesionDTO dto) {
        if (membreRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Un membre avec cet email existe déjà");
        }

        DemandeAdhesion demande = DemandeAdhesion.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motivation(dto.getMotivation())
                .statut(DemandeAdhesion.StatutDemande.EN_ATTENTE)
                .build();

        DemandeAdhesion saved = adhesionRepository.save(demande);

        // Notifier tous les admins et directeurs
        List<Membre> responsables = membreRepository.findByRoleIn(
                List.of(Membre.RoleMembre.ROLE_ADMIN, Membre.RoleMembre.ROLE_DIRECTEUR));
        responsables.forEach(resp -> notificationRepository.save(
                Notification.builder()
                        .membre(resp)
                        .message("📋 Nouvelle demande d'adhésion de "
                                + dto.getPrenom() + " " + dto.getNom()
                                + " (" + dto.getEmail() + ")")
                        .lu(false)
                        .build()));

        log.info("Demande d'adhésion soumise pour: {}", dto.getEmail());
        return toDTO(saved);
    }

    public Page<AdhesionDTO> getAll(Pageable pageable) {
        return adhesionRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<AdhesionDTO> getByStatut(
            DemandeAdhesion.StatutDemande statut, Pageable pageable) {
        return adhesionRepository.findByStatut(statut, pageable).map(this::toDTO);
    }

    @Transactional
    public AdhesionDTO valider(Long id, String directeurEmail) {
        DemandeAdhesion demande = adhesionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande", id));

        if (demande.getStatut() != DemandeAdhesion.StatutDemande.EN_ATTENTE) {
            throw new BusinessException("Cette demande a déjà été traitée");
        }

        Membre directeur = membreRepository.findByEmail(directeurEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Directeur non trouvé: " + directeurEmail));

        demande.setStatut(DemandeAdhesion.StatutDemande.ACCEPTEE);
        demande.setDateDecision(LocalDateTime.now());
        demande.setDirecteur(directeur);
        adhesionRepository.save(demande);

        // Créer automatiquement le compte membre
        MembreCreateDTO createDTO = new MembreCreateDTO();
        createDTO.setNom(demande.getNom());
        createDTO.setPrenom(demande.getPrenom());
        createDTO.setEmail(demande.getEmail());
        createDTO.setPassword("Lias2026!");
        createDTO.setStatut(Membre.StatutMembre.DOCTORANT);
        createDTO.setRole(Membre.RoleMembre.ROLE_DOCTORANT);
        authService.register(createDTO);

        log.info("Demande {} acceptée, compte créé pour: {}",
                id, demande.getEmail());
        return toDTO(demande);
    }

    @Transactional
    public AdhesionDTO refuser(Long id, String directeurEmail) {
        DemandeAdhesion demande = adhesionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande", id));

        if (demande.getStatut() != DemandeAdhesion.StatutDemande.EN_ATTENTE) {
            throw new BusinessException("Cette demande a déjà été traitée");
        }

        Membre directeur = membreRepository.findByEmail(directeurEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Directeur non trouvé: " + directeurEmail));

        demande.setStatut(DemandeAdhesion.StatutDemande.REFUSEE);
        demande.setDateDecision(LocalDateTime.now());
        demande.setDirecteur(directeur);
        adhesionRepository.save(demande);

        log.info("Demande {} refusée", id);
        return toDTO(demande);
    }

    public AdhesionDTO toDTO(DemandeAdhesion d) {
        AdhesionDTO dto = new AdhesionDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setPrenom(d.getPrenom());
        dto.setEmail(d.getEmail());
        dto.setMotivation(d.getMotivation());
        dto.setStatut(d.getStatut());
        dto.setDateSoumission(d.getDateSoumission());
        dto.setDateDecision(d.getDateDecision());
        return dto;
    }
}