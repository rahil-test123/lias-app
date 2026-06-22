// Fichier : src/main/java/com/lias/lias_backend/service/EvenementService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.EvenementDTO;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.Evenement;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.EvenementRepository;
import com.lias.lias_backend.repository.MembreRepository;
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
public class EvenementService {

    private final EvenementRepository evenementRepository;
    private final MembreRepository membreRepository;

    @Transactional(readOnly = true)
    public Page<EvenementDTO> getAll(Pageable pageable) {
        return evenementRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public EvenementDTO getById(Long id) {
        return toDTO(evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", id)));
    }

    @Transactional(readOnly = true)
    public List<EvenementDTO> getEvenementsAVenir() {
        return evenementRepository.findEvenementsAVenir(LocalDate.now())
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EvenementDTO create(EvenementDTO dto, String email) {
        Membre organisateur = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membre non trouvé: " + email));

        Evenement evenement = Evenement.builder()
                .titre(dto.getTitre())
                .type(dto.getType())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .lieu(dto.getLieu())
                .description(dto.getDescription())
                .organisateur(organisateur)
                .build();

        Evenement saved = evenementRepository.save(evenement);
        log.info("Événement créé: {}", saved.getTitre());
        return toDTO(saved);
    }

    @Transactional
    public EvenementDTO update(Long id, EvenementDTO dto) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement", id));

        evenement.setTitre(dto.getTitre());
        evenement.setType(dto.getType());
        evenement.setDateDebut(dto.getDateDebut());
        evenement.setDateFin(dto.getDateFin());
        evenement.setLieu(dto.getLieu());
        evenement.setDescription(dto.getDescription());

        return toDTO(evenementRepository.save(evenement));
    }

    @Transactional
    public void delete(Long id) {
        if (!evenementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evenement", id);
        }
        evenementRepository.deleteById(id);
        log.info("Événement {} supprimé", id);
    }

    @Transactional(readOnly = true)
    public List<EvenementDTO> rechercher(String terme) {
        return evenementRepository.rechercherEvenements(terme)
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EvenementDTO toDTO(Evenement e) {
        EvenementDTO dto = new EvenementDTO();
        dto.setId(e.getId());
        dto.setTitre(e.getTitre());
        dto.setType(e.getType());
        dto.setDateDebut(e.getDateDebut());
        dto.setDateFin(e.getDateFin());
        dto.setLieu(e.getLieu());
        dto.setDescription(e.getDescription());
        if (e.getOrganisateur() != null) {
            dto.setOrganisateurId(e.getOrganisateur().getId());
            dto.setOrganisateurNom(e.getOrganisateur().getNom() + " " +
                    e.getOrganisateur().getPrenom());
        }
        return dto;
    }
}