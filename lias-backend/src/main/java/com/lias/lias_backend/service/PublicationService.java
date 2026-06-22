// Fichier : src/main/java/com/lias/lias_backend/service/PublicationService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.PublicationDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.Equipe;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.model.Publication;
import com.lias.lias_backend.model.Notification;
import com.lias.lias_backend.repository.EquipeRepository;
import com.lias.lias_backend.repository.MembreRepository;
import com.lias.lias_backend.repository.NotificationRepository;
import com.lias.lias_backend.repository.PublicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicationService {

    private final PublicationRepository publicationRepository;
    private final MembreRepository membreRepository;
    private final EquipeRepository equipeRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<PublicationDTO> getAllPublications(Pageable pageable) {
        return publicationRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public PublicationDTO getById(Long id) {
        return toDTO(publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", id)));
    }

    @Transactional
    public PublicationDTO create(PublicationDTO dto, String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));

        Publication pub = Publication.builder()
                .titre(dto.getTitre())
                .auteurs(dto.getAuteurs())
                .annee(dto.getAnnee())
                .type(dto.getType())
                .lien(dto.getLien())
                .membre(membre)
                .build();

        if (dto.getEquipeId() != null) {
            Equipe equipe = equipeRepository.findById(dto.getEquipeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Equipe", dto.getEquipeId()));
            pub.setEquipe(equipe);
        }

        Publication saved = publicationRepository.save(pub);

        // Notifier l'auteur
        notificationRepository.save(Notification.builder()
                .membre(membre)
                .message("📄 Votre publication \"" + saved.getTitre()
                        + "\" a été enregistrée avec succès.")
                .lu(false)
                .build());

        log.info("Publication créée: {}", saved.getTitre());
        return toDTO(saved);
    }

    @Transactional
    public PublicationDTO update(Long id, PublicationDTO dto, String email) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", id));

        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));

        boolean isOwner = pub.getMembre().getId().equals(membre.getId());
        boolean isAdmin = membre.getRole() == Membre.RoleMembre.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BusinessException(
                    "Vous n'êtes pas autorisé à modifier cette publication");
        }

        pub.setTitre(dto.getTitre());
        pub.setAuteurs(dto.getAuteurs());
        pub.setAnnee(dto.getAnnee());
        pub.setType(dto.getType());
        pub.setLien(dto.getLien());

        return toDTO(publicationRepository.save(pub));
    }

    @Transactional
    public void delete(Long id) {
        if (!publicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Publication", id);
        }
        publicationRepository.deleteById(id);
        log.info("Publication supprimée: {}", id);
    }

    @Transactional(readOnly = true)
    public List<PublicationDTO> rechercher(String terme) {
        return publicationRepository.rechercherPublications(terme)
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PublicationDTO toDTO(Publication pub) {
        PublicationDTO dto = new PublicationDTO();
        dto.setId(pub.getId());
        dto.setTitre(pub.getTitre());
        dto.setAuteurs(pub.getAuteurs());
        dto.setAnnee(pub.getAnnee());
        dto.setType(pub.getType());
        dto.setLien(pub.getLien());
        if (pub.getMembre() != null) {
            dto.setMembreId(pub.getMembre().getId());
            dto.setMembreNom(pub.getMembre().getNom() + " " +
                    pub.getMembre().getPrenom());
        }
        if (pub.getEquipe() != null) {
            dto.setEquipeId(pub.getEquipe().getId());
            dto.setEquipeNom(pub.getEquipe().getNom());
        }
        return dto;
    }
}