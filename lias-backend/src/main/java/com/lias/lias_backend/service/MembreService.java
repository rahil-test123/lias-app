// Fichier : src/main/java/com/lias/lias_backend/service/MembreService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.MembreDTO;
import com.lias.lias_backend.dto.MembreProfilUpdateDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.HistoriqueAction;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.HistoriqueActionRepository;
import com.lias.lias_backend.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembreService {

    private final MembreRepository membreRepository;
    private final HistoriqueActionRepository historiqueRepository;
    private final ModelMapper modelMapper;

    public Page<MembreDTO> getAllMembres(Pageable pageable) {
        return membreRepository.findAll(pageable)
                .map(this::toDTO);
    }

    public List<MembreDTO> getMembresActifs() {
        return membreRepository.findByActifTrue()
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MembreDTO getMembreById(Long id) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", id));
        return toDTO(membre);
    }

    public MembreDTO getMembreByEmail(String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));
        return toDTO(membre);
    }

    @Transactional
    public MembreDTO updateProfil(String email, MembreProfilUpdateDTO dto) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));

        if (dto.getNom() != null) membre.setNom(dto.getNom());
        if (dto.getPrenom() != null) membre.setPrenom(dto.getPrenom());
        if (dto.getBiographie() != null) membre.setBiographie(dto.getBiographie());
        if (dto.getCentresInteret() != null) membre.setCentresInteret(dto.getCentresInteret());
        if (dto.getEtablissementOrigine() != null)
            membre.setEtablissementOrigine(dto.getEtablissementOrigine());
        if (dto.getLaboratoireOrigine() != null)
            membre.setLaboratoireOrigine(dto.getLaboratoireOrigine());

        Membre saved = membreRepository.save(membre);

        // Historique
        saveHistorique(membre, "MODIFICATION_PROFIL", "Profil mis à jour");

        log.info("Profil mis à jour pour: {}", email);
        return toDTO(saved);
    }

    @Transactional
    public MembreDTO toggleActif(Long id, String adminEmail) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", id));

        Membre admin = membreRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin non trouvé: " + adminEmail));

        if (membre.getId().equals(admin.getId())) {
            throw new BusinessException("Vous ne pouvez pas désactiver votre propre compte");
        }

        membre.setActif(!membre.isActif());
        Membre saved = membreRepository.save(membre);

        saveHistorique(admin, "CHANGEMENT_ACTIF",
                "Compte de " + membre.getEmail() + " " +
                (saved.isActif() ? "activé" : "désactivé"));

        log.info("Compte {} {} par {}", membre.getEmail(),
                saved.isActif() ? "activé" : "désactivé", adminEmail);
        return toDTO(saved);
    }

    @Transactional
    public MembreDTO updateStatut(Long id, Membre.StatutMembre statut, String adminEmail) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", id));

        Membre admin = membreRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin non trouvé: " + adminEmail));

        Membre.StatutMembre ancienStatut = membre.getStatut();
        membre.setStatut(statut);

        if (statut == Membre.StatutMembre.RETRAITE ||
            statut == Membre.StatutMembre.ANCIEN) {
            membre.setActif(false);
        }

        Membre saved = membreRepository.save(membre);
        saveHistorique(admin, "CHANGEMENT_STATUT",
                "Statut de " + membre.getEmail() +
                " changé de " + ancienStatut + " à " + statut);

        log.info("Statut de {} changé à {}", membre.getEmail(), statut);
        return toDTO(saved);
    }

    @Transactional
    public MembreDTO updatePhoto(Long id, String photoPath) {
        Membre membre = membreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membre", id));
        membre.setPhoto(photoPath);
        return toDTO(membreRepository.save(membre));
    }

    public List<MembreDTO> rechercher(String terme) {
        return membreRepository.rechercherMembres(terme)
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    private void saveHistorique(Membre membre, String action, String details) {
        historiqueRepository.save(HistoriqueAction.builder()
                .membre(membre)
                .action(action)
                .details(details)
                .build());
    }

    public MembreDTO toDTO(Membre membre) {
        return modelMapper.map(membre, MembreDTO.class);
    }
}