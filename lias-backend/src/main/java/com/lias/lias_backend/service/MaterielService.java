package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.AttributionMaterielDTO;
import com.lias.lias_backend.dto.MaterielDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.AttributionMateriel;
import com.lias.lias_backend.model.Materiel;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.model.Notification;
import com.lias.lias_backend.repository.AttributionMaterielRepository;
import com.lias.lias_backend.repository.MaterielRepository;
import com.lias.lias_backend.repository.MembreRepository;
import com.lias.lias_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterielService {

    private final MaterielRepository materielRepository;
    private final AttributionMaterielRepository attributionRepository;
    private final MembreRepository membreRepository;
    private final NotificationRepository notificationRepository;

    // ---------- Matériel CRUD ----------

    public Page<MaterielDTO> getAll(Pageable pageable) {
        return materielRepository.findAll(pageable).map(this::toMaterielDTO);
    }

    public List<MaterielDTO> getAll() {
        return materielRepository.findAll().stream()
                .map(this::toMaterielDTO).collect(Collectors.toList());
    }

    public MaterielDTO getById(Long id) {
        return toMaterielDTO(materielRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", id)));
    }

    public List<MaterielDTO> rechercher(String nom) {
        return materielRepository.findByNomContainingIgnoreCase(nom)
                .stream().map(this::toMaterielDTO).collect(Collectors.toList());
    }

    @Transactional
    public MaterielDTO create(MaterielDTO dto) {
        Materiel materiel = Materiel.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .quantiteTotal(dto.getQuantiteTotal())
                .dateArrivage(dto.getDateArrivage())
                .build();

        Materiel saved = materielRepository.save(materiel);
        log.info("Matériel créé: {}", saved.getNom());
        return toMaterielDTO(saved);
    }

    @Transactional
    public MaterielDTO update(Long id, MaterielDTO dto) {
        Materiel materiel = materielRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", id));

        Integer totalAttribue = getTotalAttribue(id);
        if (dto.getQuantiteTotal() < totalAttribue) {
            throw new BusinessException(
                    "Impossible de réduire la quantité en dessous du total attribué ("
                    + totalAttribue + ")");
        }

        materiel.setNom(dto.getNom());
        materiel.setDescription(dto.getDescription());
        materiel.setQuantiteTotal(dto.getQuantiteTotal());
        materiel.setDateArrivage(dto.getDateArrivage());

        log.info("Matériel {} mis à jour", id);
        return toMaterielDTO(materielRepository.save(materiel));
    }

    @Transactional
    public void delete(Long id) {
        if (!materielRepository.existsById(id)) {
            throw new ResourceNotFoundException("Materiel", id);
        }
        // Supprimer toutes les attributions liées avant de supprimer le matériel
        List<AttributionMateriel> attributions = attributionRepository.findByMaterielId(id);
        if (!attributions.isEmpty()) {
            attributionRepository.deleteAll(attributions);
            log.info("Matériel {} : {} attribution(s) supprimée(s) en cascade", id, attributions.size());
        }
        materielRepository.deleteById(id);
        log.info("Matériel {} supprimé", id);
    }

    // ---------- Attributions ----------

    @Transactional(readOnly = true)
    public List<AttributionMaterielDTO> getAttributionsByMembre(Long membreId) {
        return attributionRepository.findByMembreId(membreId)
                .stream().map(this::toAttributionDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttributionMaterielDTO> getAttributionsByMateriel(Long materielId) {
        return attributionRepository.findByMaterielId(materielId)
                .stream().map(this::toAttributionDTO).collect(Collectors.toList());
    }

    @Transactional
    public AttributionMaterielDTO attribuer(AttributionMaterielDTO dto) {
        Materiel materiel = materielRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", dto.getMaterielId()));

        Membre membre = membreRepository.findById(dto.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", dto.getMembreId()));

        int disponible = getQuantiteDisponible(materiel);
        if (dto.getQuantite() > disponible) {
            throw new BusinessException(
                    "Quantité demandée (" + dto.getQuantite()
                    + ") supérieure à la quantité disponible (" + disponible + ")");
        }

        AttributionMateriel attribution = AttributionMateriel.builder()
                .materiel(materiel)
                .membre(membre)
                .quantite(dto.getQuantite())
                .dateAttribution(dto.getDateAttribution() != null
                        ? dto.getDateAttribution() : LocalDate.now())
                .build();

        AttributionMateriel saved = attributionRepository.save(attribution);

        // Notifier le membre
        notificationRepository.save(Notification.builder()
                .membre(membre)
                .message("📦 Matériel attribué : " + materiel.getNom()
                        + " (quantité : " + dto.getQuantite() + ")")
                .lu(false)
                .build());

        log.info("Matériel {} attribué à {} (quantité: {})",
                materiel.getNom(), membre.getEmail(), dto.getQuantite());
        return toAttributionDTO(saved);
    }

    @Transactional
    public void revoquerAttribution(Long attributionId) {
        if (!attributionRepository.existsById(attributionId)) {
            throw new ResourceNotFoundException("Attribution", attributionId);
        }
        attributionRepository.deleteById(attributionId);
        log.info("Attribution {} révoquée", attributionId);
    }

    // ---------- Helpers ----------

    private Integer getTotalAttribue(Long materielId) {
        Integer total = attributionRepository.getTotalAttribue(materielId);
        return total != null ? total : 0;
    }

    private int getQuantiteDisponible(Materiel materiel) {
        return materiel.getQuantiteTotal() - getTotalAttribue(materiel.getId());
    }

    public MaterielDTO toMaterielDTO(Materiel m) {
        MaterielDTO dto = new MaterielDTO();
        dto.setId(m.getId());
        dto.setNom(m.getNom());
        dto.setDescription(m.getDescription());
        dto.setQuantiteTotal(m.getQuantiteTotal());
        dto.setQuantiteDisponible(getQuantiteDisponible(m));
        dto.setDateArrivage(m.getDateArrivage());
        return dto;
    }

    public AttributionMaterielDTO toAttributionDTO(AttributionMateriel a) {
        AttributionMaterielDTO dto = new AttributionMaterielDTO();
        dto.setId(a.getId());
        dto.setQuantite(a.getQuantite());
        dto.setDateAttribution(a.getDateAttribution());
        if (a.getMateriel() != null) {
            dto.setMaterielId(a.getMateriel().getId());
            dto.setMaterielNom(a.getMateriel().getNom());
            dto.setQuantiteDisponible(getQuantiteDisponible(a.getMateriel()));
        }
        if (a.getMembre() != null) {
            dto.setMembreId(a.getMembre().getId());
            dto.setMembreNom(a.getMembre().getNom() + " " + a.getMembre().getPrenom());
        }
        return dto;
    }
}
