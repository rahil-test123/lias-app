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
    private final com.lias.lias_backend.repository.AffectationStockRepository affectations;
    private final com.lias.lias_backend.repository.ReceptionMaterielRepository receptions;
    private final JournalStockService audit;
    private final com.lias.lias_backend.repository.BeneficiaireMaterielRepository beneficiaires;
    private final com.lias.lias_backend.repository.DemandeMaterielRepository demandes;
    @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager entityManager;

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
        materiel.setCategorie(dto.getCategorie());materiel.setEtat(dto.getEtat());materiel.setRemarques(dto.getRemarques());

        Materiel saved = materielRepository.save(materiel);
        if(saved.getQuantiteTotal()>0) {
            var r=new com.lias.lias_backend.model.ReceptionMateriel();r.setMaterielId(saved.getId());r.setMaterielNom(saved.getNom());r.setCategorie(GestionStockService.categorie(saved));
            r.setQuantite(saved.getQuantiteTotal());r.setDateReception(saved.getDateArrivage()==null?LocalDate.now():saved.getDateArrivage());r.setCreeLe(java.time.LocalDateTime.now());r.setAdministrateur(audit.acteur());r.setRemarques("Stock initial enregistré à la création");receptions.save(r);
        }
        audit.noter("MATERIEL_CREE",saved.getId(),null,saved.getNom()+" : stock initial "+saved.getQuantiteTotal());
        log.info("Matériel créé: {}", saved.getNom());
        return toMaterielDTO(saved);
    }

    @Transactional
    public MaterielDTO update(Long id, MaterielDTO dto) {
        Materiel materiel = materielRepository.verrouiller(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", id));

        Integer totalAttribue = getTotalAttribue(id);
        String nouvelleCategorie=dto.getCategorie()==null || dto.getCategorie().isBlank()?GestionStockService.categorie(materiel):dto.getCategorie().trim();
        if(!nouvelleCategorie.equalsIgnoreCase(GestionStockService.categorie(materiel)) && demandes.existsByMaterielId(id)) throw new BusinessException("Ce type est associé à des demandes. Créez une nouvelle référence pour un autre type de matériel.");
        if(!dto.getQuantiteTotal().equals(materiel.getQuantiteTotal()) && (dto.getRemarques()==null || dto.getRemarques().isBlank())) throw new BusinessException("Indiquez le motif de correction du stock dans les remarques");
        String avant=materiel.getNom()+" / "+materiel.getCategorie()+" / "+materiel.getEtat()+" / stock "+materiel.getQuantiteTotal()+" / "+materiel.getDescription();
        for(var a:attributionRepository.findByMaterielId(id)) {
            if(a.getMaterielNomSnapshot()==null) a.setMaterielNomSnapshot(materiel.getNom());
            if(a.getCategorieSnapshot()==null) a.setCategorieSnapshot(GestionStockService.categorie(materiel));
            if(a.getBeneficiaireNomSnapshot()==null) a.setBeneficiaireNomSnapshot(a.getMembre().getPrenom()+" "+a.getMembre().getNom());
        }
        if (dto.getQuantiteTotal() < totalAttribue) {
            throw new BusinessException(
                    "Impossible de réduire la quantité en dessous du total attribué ("
                    + totalAttribue + ")");
        }

        materiel.setNom(dto.getNom());
        materiel.setDescription(dto.getDescription());
        materiel.setQuantiteTotal(dto.getQuantiteTotal());
        materiel.setDateArrivage(dto.getDateArrivage());
        materiel.setCategorie(nouvelleCategorie);materiel.setEtat(dto.getEtat());materiel.setRemarques(dto.getRemarques());
        audit.noter("MATERIEL_MODIFIE",id,null,avant+" → "+materiel.getNom()+" / "+materiel.getCategorie()+" / "+materiel.getEtat()+" / stock "+materiel.getQuantiteTotal()+" / "+materiel.getDescription()+" ; "+dto.getRemarques());

        log.info("Matériel {} mis à jour", id);
        return toMaterielDTO(materielRepository.save(materiel));
    }

    @Transactional
    public void delete(Long id) {
        var m=materielRepository.verrouiller(id).orElseThrow(()->new ResourceNotFoundException("Materiel",id));
        m.setArchive(true);audit.noter("MATERIEL_ARCHIVE",id,null,m.getNom()+" ; historique et stock conservés");
    }

    // ---------- Attributions ----------

    @Transactional(readOnly = true)
    public List<AttributionMaterielDTO> getAttributionsByMembre(Long membreId) {
        var result=attributionRepository.findByMembreId(membreId).stream().map(this::toAttributionDTO).collect(Collectors.toCollection(java.util.ArrayList::new));
        beneficiaires.findByMembreId(membreId).ifPresent(b->affectations.findByBeneficiaireId(b.getId()).forEach(a->result.add(toStockDTO(a))));
        return result;
    }

    @Transactional(readOnly = true)
    public List<AttributionMaterielDTO> getAttributionsByMateriel(Long materielId) {
        var result=attributionRepository.findByMaterielId(materielId).stream().map(this::toAttributionDTO).collect(Collectors.toCollection(java.util.ArrayList::new));
        affectations.findByMaterielId(materielId).forEach(a->result.add(toStockDTO(a)));return result;
    }

    @Transactional
    public AttributionMaterielDTO attribuer(AttributionMaterielDTO dto) {
        Materiel materiel = materielRepository.verrouiller(dto.getMaterielId())
                .orElseThrow(() -> new ResourceNotFoundException("Materiel", dto.getMaterielId()));
        if(materiel.isArchive()) throw new BusinessException("Matériel archivé");
        if(dto.getCleOperation()==null || dto.getCleOperation().isBlank()) throw new BusinessException("Clé d'opération obligatoire");
        var existing=attributionRepository.findByCleOperation(dto.getCleOperation());
        if(existing.isPresent()) {
            var a=existing.get();
            if(!a.getMateriel().getId().equals(dto.getMaterielId()) || !a.getMembre().getId().equals(dto.getMembreId()) || !a.getQuantite().equals(dto.getQuantite())) throw new BusinessException("Clé d'opération déjà utilisée");
            return toAttributionDTO(a);
        }

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
        saved.setCleOperation(dto.getCleOperation());saved.setAdministrateur(audit.acteur());
        saved.setMaterielNomSnapshot(materiel.getNom());saved.setCategorieSnapshot(GestionStockService.categorie(materiel));saved.setBeneficiaireNomSnapshot(membre.getPrenom()+" "+membre.getNom());
        audit.noter("ATTRIBUTION_DIRECTE",materiel.getId(),null,membre.getPrenom()+" "+membre.getNom()+" : "+dto.getQuantite());

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
    public void revoquerAttribution(Long attributionId,String motif) {
        var initial=attributionRepository.findById(attributionId).orElseThrow(()->new ResourceNotFoundException("Attribution",attributionId));
        materielRepository.verrouiller(initial.getMateriel().getId()).orElseThrow();
        entityManager.refresh(initial,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if(initial.isAnnule()) throw new BusinessException("Attribution déjà annulée");
        if(motif==null || motif.isBlank()) throw new BusinessException("Motif d'annulation obligatoire");
        initial.setAnnule(true);initial.setMotifAnnulation(motif);initial.setDateAnnulation(java.time.LocalDateTime.now());
        audit.noter("ATTRIBUTION_ANNULEE",initial.getMateriel().getId(),null,initial.getId()+" / "+initial.getQuantite()+" rendu(s) au stock : "+motif);
    }

    // ---------- Helpers ----------
    private AttributionMaterielDTO toStockDTO(com.lias.lias_backend.model.AffectationStock a) {
        var dto=new AttributionMaterielDTO();dto.setId(a.getId());dto.setMaterielId(a.getMaterielId());dto.setMaterielNom(a.getMaterielNom());dto.setMembreNom(a.getBeneficiaireNom());
        dto.setQuantite(a.getQuantite());dto.setDateAttribution(a.getDateAffectation().toLocalDate());dto.setAdministrateur(a.getAdministrateur());dto.setAnnule("ANNULEE".equals(a.getStatut()));
        dto.setMotifAnnulation(a.getMotifAnnulation());dto.setGestionDemande(true);
        beneficiaires.findById(a.getBeneficiaireId()).ifPresent(b->dto.setMembreId(b.getMembreId()));return dto;
    }

    private Integer getTotalAttribue(Long materielId) {
        Integer total = attributionRepository.getTotalAttribue(materielId);
        return (total != null ? total : 0)+affectations.totalActif(materielId);
    }

    private int getQuantiteDisponible(Materiel materiel) {
        return materiel.getQuantiteTotal() - getTotalAttribue(materiel.getId());
    }

    public MaterielDTO toMaterielDTO(Materiel m) {
        MaterielDTO dto = new MaterielDTO();
        dto.setId(m.getId());
        dto.setNom(m.getNom());
        dto.setDescription(m.getDescription());
        dto.setCategorie(GestionStockService.categorie(m));dto.setEtat(m.getEtat());dto.setRemarques(m.getRemarques());dto.setArchive(m.isArchive());
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
        dto.setAnnule(a.isAnnule());dto.setAdministrateur(a.getAdministrateur());dto.setMotifAnnulation(a.getMotifAnnulation());
        if (a.getMateriel() != null) {
            dto.setMaterielId(a.getMateriel().getId());
            dto.setMaterielNom(a.getMaterielNomSnapshot()==null?a.getMateriel().getNom():a.getMaterielNomSnapshot());
            dto.setQuantiteDisponible(getQuantiteDisponible(a.getMateriel()));
        }
        if (a.getMembre() != null) {
            dto.setMembreId(a.getMembre().getId());
            dto.setMembreNom(a.getMembre().getNom() + " " + a.getMembre().getPrenom());
        }
        return dto;
    }
}
