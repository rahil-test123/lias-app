// Fichier : src/main/java/com/lias/lias_backend/service/RapportService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.RapportDTO;
import com.lias.lias_backend.model.DemandeAdhesion;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class RapportService {

    private final MembreRepository membreRepository;
    private final PublicationRepository publicationRepository;
    private final EvenementRepository evenementRepository;
    private final DemandeAdhesionRepository adhesionRepository;
    private final PublicationService publicationService;
    private final EvenementService evenementService;

    @Transactional(readOnly = true)
    public RapportDTO genererRapport(Integer annee) {
        log.info("Génération du rapport pour l'année: {}", annee);

        LocalDate debut = LocalDate.of(annee, 1, 1);
        LocalDate fin = LocalDate.of(annee, 12, 31);

        long nbMembres = membreRepository.findByActifTrue().size();
        long nbPermanents = membreRepository
                .findByStatut(Membre.StatutMembre.PERMANENT).size();
        long nbDoctorants = membreRepository
                .findByStatut(Membre.StatutMembre.DOCTORANT).size();
        long nbPublications = publicationRepository.countByAnnee(annee);
        long nbEvenements = evenementRepository.countByDateDebutBetween(debut, fin);
        long nbDemandes = adhesionRepository
                .countByStatut(DemandeAdhesion.StatutDemande.EN_ATTENTE);
        long nbAcceptees = adhesionRepository
                .countByStatut(DemandeAdhesion.StatutDemande.ACCEPTEE);

        return RapportDTO.builder()
                .annee(annee)
                .nbMembres(nbMembres)
                .nbMembersPermanents(nbPermanents)
                .nbDoctorants(nbDoctorants)
                .nbPublications(nbPublications)
                .nbEvenements(nbEvenements)
                .nbDemandesAdhesion(nbDemandes)
                .nbDemandesAcceptees(nbAcceptees)
                .topPublications(publicationRepository
                        .findByAnnee(annee).stream()
                        .map(publicationService::toDTO)
                        .toList())
                .evenements(evenementRepository
                        .findByDateDebutBetween(debut, fin).stream()
                        .map(evenementService::toDTO)
                        .toList())
                .build();
    }
}