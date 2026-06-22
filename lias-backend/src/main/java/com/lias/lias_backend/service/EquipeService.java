package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.AffiliationDTO;
import com.lias.lias_backend.dto.EquipeDTO;
import com.lias.lias_backend.dto.MandatDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.Affiliation;
import com.lias.lias_backend.model.Equipe;
import com.lias.lias_backend.model.Mandat;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipeService {

    private final EquipeRepository equipeRepository;
    private final AffiliationRepository affiliationRepository;
    private final MandatRepository mandatRepository;
    private final MembreRepository membreRepository;

    // ─── Équipes ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EquipeDTO> getAll() {
        return equipeRepository.findAll().stream()
                .map(this::toDTOSimple)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipeDTO getById(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", id));
        return toDTODetail(equipe);
    }

    @Transactional
    public EquipeDTO create(EquipeDTO dto) {
        if (equipeRepository.existsByNom(dto.getNom())) {
            throw new BusinessException("Une équipe avec ce nom existe déjà");
        }
        Equipe equipe = Equipe.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .dateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : LocalDate.now())
                .build();
        Equipe saved = equipeRepository.save(equipe);
        log.info("Équipe créée: {}", saved.getNom());
        return toDTOSimple(saved);
    }

    @Transactional
    public EquipeDTO update(Long id, EquipeDTO dto) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", id));
        equipe.setNom(dto.getNom());
        equipe.setDescription(dto.getDescription());
        if (dto.getDateCreation() != null) equipe.setDateCreation(dto.getDateCreation());
        log.info("Équipe {} mise à jour", id);
        return toDTOSimple(equipeRepository.save(equipe));
    }

    @Transactional
    public void delete(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", id));
        List<Affiliation> actifs = affiliationRepository.findMembresActifsByEquipe(id);
        if (!actifs.isEmpty()) {
            throw new BusinessException(
                    "Impossible de supprimer une équipe avec des membres actifs (" + actifs.size() + " membre(s))");
        }
        equipeRepository.deleteById(id);
        log.info("Équipe {} supprimée", id);
    }

    // ─── Affiliations ─────────────────────────────────────────

    @Transactional
    public AffiliationDTO ajouterMembre(Long equipeId, Long membreId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", equipeId));
        Membre membre = membreRepository.findById(membreId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", membreId));

        // Vérifier si déjà membre actif de cette équipe
        boolean dejaAffilie = affiliationRepository.findMembresActifsByEquipe(equipeId)
                .stream().anyMatch(a -> a.getMembre().getId().equals(membreId));
        if (dejaAffilie) {
            throw new BusinessException("Ce membre est déjà affilié à cette équipe");
        }

        Affiliation affiliation = Affiliation.builder()
                .equipe(equipe)
                .membre(membre)
                .dateDebut(LocalDate.now())
                .build();

        Affiliation saved = affiliationRepository.save(affiliation);
        log.info("Membre {} ajouté à l'équipe {}", membreId, equipeId);
        return toAffiliationDTO(saved);
    }

    @Transactional
    public void retirerMembre(Long affiliationId) {
        Affiliation affiliation = affiliationRepository.findById(affiliationId)
                .orElseThrow(() -> new ResourceNotFoundException("Affiliation", affiliationId));
        affiliation.setDateFin(LocalDate.now());
        affiliationRepository.save(affiliation);
        log.info("Affiliation {} terminée", affiliationId);
    }

    // ─── Mandats ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MandatDTO> getMandats() {
        return mandatRepository.findAll().stream()
                .map(this::toMandatDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MandatDTO ajouterMandat(MandatDTO dto) {
        Membre membre = membreRepository.findById(dto.getMembreId())
                .orElseThrow(() -> new ResourceNotFoundException("Membre", dto.getMembreId()));

        // Terminer l'ancien mandat actif du même rôle
        mandatRepository.findAll().stream()
                .filter(m -> m.getRole().name().equals(dto.getRole()) && m.getDateFin() == null)
                .forEach(m -> { m.setDateFin(LocalDate.now()); mandatRepository.save(m); });

        Mandat mandat = Mandat.builder()
                .membre(membre)
                .role(Mandat.RoleMandat.valueOf(dto.getRole()))
                .dateDebut(dto.getDateDebut() != null ? dto.getDateDebut() : LocalDate.now())
                .build();

        Mandat saved = mandatRepository.save(mandat);
        log.info("Mandat {} attribué à {}", dto.getRole(), membre.getEmail());
        return toMandatDTO(saved);
    }

    @Transactional
    public void terminerMandat(Long mandatId) {
        Mandat mandat = mandatRepository.findById(mandatId)
                .orElseThrow(() -> new ResourceNotFoundException("Mandat", mandatId));
        mandat.setDateFin(LocalDate.now());
        mandatRepository.save(mandat);
        log.info("Mandat {} terminé", mandatId);
    }

    // ─── Mappers ──────────────────────────────────────────────

    private EquipeDTO toDTOSimple(Equipe e) {
        EquipeDTO dto = new EquipeDTO();
        dto.setId(e.getId());
        dto.setNom(e.getNom());
        dto.setDescription(e.getDescription());
        dto.setDateCreation(e.getDateCreation());
        dto.setNbMembres(affiliationRepository.findMembresActifsByEquipe(e.getId()).size());
        return dto;
    }

    private EquipeDTO toDTODetail(Equipe e) {
        EquipeDTO dto = toDTOSimple(e);
        dto.setMembres(affiliationRepository.findMembresActifsByEquipe(e.getId())
                .stream().map(this::toAffiliationDTO).collect(Collectors.toList()));
        dto.setMandats(mandatRepository.findAll().stream()
                .filter(m -> m.getMembre() != null && m.getDateFin() == null)
                .map(this::toMandatDTO).collect(Collectors.toList()));
        return dto;
    }

    public AffiliationDTO toAffiliationDTO(Affiliation a) {
        AffiliationDTO dto = new AffiliationDTO();
        dto.setId(a.getId());
        dto.setDateDebut(a.getDateDebut());
        dto.setDateFin(a.getDateFin());
        if (a.getMembre() != null) {
            dto.setMembreId(a.getMembre().getId());
            dto.setMembreNom(a.getMembre().getPrenom() + " " + a.getMembre().getNom());
            dto.setMembreEmail(a.getMembre().getEmail());
            dto.setMembreStatut(a.getMembre().getStatut().name());
        }
        if (a.getEquipe() != null) {
            dto.setEquipeId(a.getEquipe().getId());
            dto.setEquipeNom(a.getEquipe().getNom());
        }
        return dto;
    }

    public MandatDTO toMandatDTO(Mandat m) {
        MandatDTO dto = new MandatDTO();
        dto.setId(m.getId());
        dto.setRole(m.getRole().name());
        dto.setDateDebut(m.getDateDebut());
        dto.setDateFin(m.getDateFin());
        if (m.getMembre() != null) {
            dto.setMembreId(m.getMembre().getId());
            dto.setMembreNom(m.getMembre().getPrenom() + " " + m.getMembre().getNom());
        }
        return dto;
    }
}
