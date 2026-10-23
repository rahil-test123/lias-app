package com.lias.lias_backend.service;
import com.lias.lias_backend.dto.StockInputs.*;
import com.lias.lias_backend.exception.*;
import com.lias.lias_backend.model.*;
import com.lias.lias_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class GestionStockService {
    private final MaterielRepository materiels;
    private final MembreRepository membres;
    private final BeneficiaireMaterielRepository beneficiaires;
    private final DemandeMaterielRepository demandes;
    private final AffectationStockRepository affectations;
    private final ReceptionMaterielRepository receptions;
    private final ReglesPrioriteMaterielRepository regles;
    private final AttributionMaterielRepository anciennes;
    private final JournalMaterielRepository journal;
    private final JournalStockService audit;
    private final MaterielService inventaire;
    @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager entityManager;

    public static String categorie(Materiel m) { return m.getCategorie()==null || m.getCategorie().isBlank() ? m.getNom() : m.getCategorie().trim(); }
    private Materiel verrouiller(Long id) { return materiels.verrouiller(id).orElseThrow(()->new ResourceNotFoundException("Matériel",id)); }
    private DemandeMateriel demande(Long id) { return demandes.verrouiller(id).orElseThrow(()->new ResourceNotFoundException("Demande",id)); }
    private BeneficiaireMateriel beneficiaire(Long id) { return beneficiaires.findById(id).orElseThrow(()->new ResourceNotFoundException("Bénéficiaire",id)); }
    private int servi(Long id) { return affectations.findByDemandeId(id).stream().filter(a->"ACTIVE".equals(a.getStatut())).mapToInt(AffectationStock::getQuantite).sum(); }
    private boolean ouverte(DemandeMateriel d) { return List.of("EN_ATTENTE","PARTIELLEMENT_SATISFAITE").contains(d.getStatut()); }
    private void statut(DemandeMateriel d) { int n=servi(d.getId());d.setStatut(n>=d.getQuantite()?"SATISFAITE":n>0?"PARTIELLEMENT_SATISFAITE":"EN_ATTENTE"); }
    private int disponible(Materiel m) { return m.getQuantiteTotal()-Optional.ofNullable(anciennes.getTotalAttribue(m.getId())).orElse(0)-affectations.totalActif(m.getId()); }

    public BeneficiaireMateriel creerBeneficiaire(Beneficiaire i) {
        var b=new BeneficiaireMateriel();
        if(i.membreId()!=null) {
            if(beneficiaires.findByMembreId(i.membreId()).isPresent()) throw new BusinessException("Ce membre existe déjà dans les bénéficiaires");
            var m=membres.findById(i.membreId()).orElseThrow(()->new ResourceNotFoundException("Membre",i.membreId()));
            b.setNom(m.getNom());b.setPrenom(m.getPrenom());b.setMembreId(m.getId());
        } else { b.setNom(i.nom().trim());b.setPrenom(i.prenom().trim()); }
        b.setService(i.service());beneficiaires.save(b);audit.noter("BENEFICIAIRE_CREE",null,null,b.getId()+" : "+b.getPrenom()+" "+b.getNom()+" / "+b.getService());return b;
    }
    public DemandeMateriel enregistrerDemande(Long id,Demande i) {
        if(id==null) { var existing=demandes.findByCleOperation(i.cleOperation()); if(existing.isPresent()) return existing.get(); }
        var b=beneficiaire(i.beneficiaireId());
        var m=materiels.findById(i.materielId()).orElseThrow(()->new ResourceNotFoundException("Matériel",i.materielId()));
        if(m.isArchive()) throw new BusinessException("Ce matériel est archivé");
        DemandeMateriel d=id==null?new DemandeMateriel():demande(id);
        if(id!=null && (!ouverte(d) || servi(id)>0)) throw new BusinessException("Une demande déjà servie ou clôturée ne peut plus être modifiée");
        String avant=id==null?"":d.getQuantite()+" / priorité "+d.getPriorite()+" / nécessité "+d.getNecessite()+" / motif "+d.getMotif();
        d.setBeneficiaireId(b.getId());d.setMaterielId(m.getId());d.setCategorie(categorie(m));d.setQuantite(i.quantite());
        d.setPriorite(i.priorite());d.setNecessite(i.necessite());d.setCritereSpecifique(i.critereSpecifique());d.setMotif(i.motif());d.setDateDemande(i.dateDemande());
        if(id==null) { d.setCreeLe(LocalDateTime.now());d.setCleOperation(i.cleOperation());d.setStatut("EN_ATTENTE"); }
        demandes.save(d);audit.noter(id==null?"DEMANDE_CREEE":"DEMANDE_MODIFIEE",m.getId(),d.getId(),avant+" → "+d.getQuantite()+" / priorité "+d.getPriorite()+" / nécessité "+d.getNecessite()+" / critère "+d.getCritereSpecifique()+" / "+d.getMotif());return d;
    }
    public DemandeMateriel decision(Long id,Decision i) {
        var d=demande(id);
        if(!ouverte(d)) throw new BusinessException("Cette demande est déjà clôturée");
        if(!List.of("REFUSEE","ANNULEE").contains(i.statut())) throw new BusinessException("Décision invalide");
        d.setStatut(i.statut());d.setMotifDecision(i.motif());audit.noter("DEMANDE_"+i.statut(),d.getMaterielId(),id,i.motif());return d;
    }
    public DemandeMateriel ordre(Long id,Ordre i) {
        var d=demande(id);if(!ouverte(d)) throw new BusinessException("Demande clôturée");
        Integer avant=d.getRangManuel();d.setRangManuel(i.rang());d.setMotifOrdre(i.motif());audit.noter("PRIORITE_MANUELLE",d.getMaterielId(),id,avant+" → "+i.rang()+" : "+i.motif());return d;
    }
    public ReceptionMateriel recevoir(Reception i) {
        var m=verrouiller(i.materielId());
        var existing=receptions.findByCleOperation(i.cleOperation());if(existing.isPresent()) {
            var r=existing.get();if(!r.getMaterielId().equals(i.materielId()) || r.getQuantite()!=i.quantite() || !r.getDateReception().equals(i.dateReception())) throw new BusinessException("Clé de réception déjà utilisée");return r;
        }
        if(m.isArchive()) throw new BusinessException("Matériel archivé");
        if((long)m.getQuantiteTotal()+i.quantite()>Integer.MAX_VALUE) throw new BusinessException("Stock maximal dépassé");
        var r=new ReceptionMateriel();r.setMaterielId(m.getId());r.setMaterielNom(m.getNom());r.setCategorie(categorie(m));r.setQuantite(i.quantite());
        r.setDateReception(i.dateReception());r.setCreeLe(LocalDateTime.now());r.setRemarques(i.remarques());r.setAdministrateur(audit.acteur());r.setCleOperation(i.cleOperation());
        m.setQuantiteTotal(m.getQuantiteTotal()+i.quantite());m.setDateArrivage(i.dateReception());receptions.save(r);
        audit.noter("RECEPTION",m.getId(),null,"+"+i.quantite()+" ; "+i.remarques());return r;
    }
    public ReglesPrioriteMateriel lireRegles() { return regles.findById(1L).orElseGet(ReglesPrioriteMateriel::new); }
    public void restaurer(Long id) { var m=verrouiller(id);m.setArchive(false);audit.noter("MATERIEL_RESTAURE",id,null,m.getNom()); }
    public ReglesPrioriteMateriel modifierRegles(Regles i) {
        var r=regles.verrouiller().orElseGet(ReglesPrioriteMateriel::new);
        String avant=r.getPoidsNecessite()+","+r.getPoidsPriorite()+","+r.getPoidsAnciennete()+","+r.getPenaliteDejaRecu()+","+r.getPoidsCritere();
        r.setPoidsNecessite(i.poidsNecessite());r.setPoidsPriorite(i.poidsPriorite());r.setPoidsAnciennete(i.poidsAnciennete());r.setPenaliteDejaRecu(i.penaliteDejaRecu());r.setPoidsCritere(i.poidsCritere());
        regles.save(r);audit.noter("REGLES_MODIFIEES",null,null,avant+" → "+i.poidsNecessite()+","+i.poidsPriorite()+","+i.poidsAnciennete()+","+i.penaliteDejaRecu()+","+i.poidsCritere()+" : "+i.motif());return r;
    }
    private int historique(BeneficiaireMateriel b,String categorie,List<AffectationStock> all, List<AttributionMateriel> old) {
        int n=all.stream().filter(a->a.getBeneficiaireId().equals(b.getId()) && a.getCategorie().equalsIgnoreCase(categorie) && "ACTIVE".equals(a.getStatut())).mapToInt(AffectationStock::getQuantite).sum();
        if(b.getMembreId()!=null) n+=old.stream().filter(a->!a.isAnnule() && a.getMembre().getId().equals(b.getMembreId()) && (a.getCategorieSnapshot()==null?categorie(a.getMateriel()):a.getCategorieSnapshot()).equalsIgnoreCase(categorie)).mapToInt(AttributionMateriel::getQuantite).sum();
        return n;
    }
    public static long score(DemandeMateriel d,ReglesPrioriteMateriel r,int dejaRecu,LocalDate today) {
        long age=Math.max(0,Math.min(365,ChronoUnit.DAYS.between(d.getDateDemande(),today)));
        return (long)d.getNecessite()*r.getPoidsNecessite()+(long)d.getPriorite()*r.getPoidsPriorite()+age*r.getPoidsAnciennete()+(long)d.getCritereSpecifique()*r.getPoidsCritere()-(long)dejaRecu*r.getPenaliteDejaRecu();
    }
    public List<Map<String,Object>> demandesClassees() {
        var bs=beneficiaires.findAll().stream().collect(Collectors.toMap(BeneficiaireMateriel::getId,b->b));
        var ms=materiels.findAll().stream().collect(Collectors.toMap(Materiel::getId,m->m));
        var all=affectations.findAll();var old=anciennes.findAll();var r=lireRegles();
        var rows=new ArrayList<Map<String,Object>>();
        for(var d:demandes.findAll()) {
            var b=bs.get(d.getBeneficiaireId());var m=ms.get(d.getMaterielId());int recu=all.stream().filter(a->a.getDemandeId().equals(d.getId()) && "ACTIVE".equals(a.getStatut())).mapToInt(AffectationStock::getQuantite).sum();
            int deja=historique(b,d.getCategorie(),all,old);
            Map<String,Object> row=new LinkedHashMap<>();row.put("demande",d);row.put("beneficiaire",b);row.put("materielNom",m.getNom());row.put("recu",recu);row.put("reste",Math.max(0,d.getQuantite()-recu));row.put("dejaRecuCategorie",deja);row.put("score",score(d,r,deja,LocalDate.now()));rows.add(row);
        }
        rows.sort(Comparator.<Map<String,Object>,Integer>comparing(row->{Integer rank=((DemandeMateriel)row.get("demande")).getRangManuel();return rank==null?Integer.MAX_VALUE:rank;})
            .thenComparing(row->-(Long)row.get("score"))
            .thenComparing(row->((DemandeMateriel)row.get("demande")).getDateDemande())
            .thenComparing(row->((DemandeMateriel)row.get("demande")).getCreeLe())
            .thenComparing(row->((DemandeMateriel)row.get("demande")).getId()));
        return rows;
    }
    public Map<String,Object> proposer(Long materielId) {
        var m=materiels.findById(materielId).orElseThrow(()->new ResourceNotFoundException("Matériel",materielId));
        if(m.isArchive()) throw new BusinessException("Matériel archivé");
        int stock=disponible(m),remaining=stock;var lines=new ArrayList<Map<String,Object>>();
        for(var row:demandesClassees()) {
            var d=(DemandeMateriel)row.get("demande");
            if(!ouverte(d) || !d.getCategorie().equalsIgnoreCase(categorie(m))) continue;
            int q=Math.min(remaining,(Integer)row.get("reste"));remaining-=q;
            row.put("quantiteProposee",q);lines.add(row);
        }
        return Map.of("materielId",materielId,"disponible",stock,"resteStock",remaining,"lignes",lines);
    }
    public List<AffectationStock> valider(Validation i) {
        var m=verrouiller(i.materielId());if(m.isArchive()) throw new BusinessException("Matériel archivé");
        var sorted=i.lignes().stream().sorted(Comparator.comparing(Ligne::demandeId)).toList();
        if(sorted.stream().map(Ligne::demandeId).distinct().count()!=sorted.size()) throw new BusinessException("Une demande apparaît plusieurs fois");
        var result=new ArrayList<AffectationStock>();int stock=disponible(m);
        for(var line:sorted) {
            String key=i.cleOperation()+":"+line.demandeId();var existing=affectations.findByCleOperation(key);
            if(existing.isPresent()) { if(!existing.get().getMaterielId().equals(m.getId()) || existing.get().getQuantite()!=line.quantite()) throw new BusinessException("Clé d'opération déjà utilisée");result.add(existing.get());continue; }
            var d=demande(line.demandeId());
            if(!ouverte(d) || !d.getCategorie().equalsIgnoreCase(categorie(m))) throw new BusinessException("Demande clôturée ou catégorie incompatible");
            if(line.quantite()>d.getQuantite()-servi(d.getId())) throw new BusinessException("Quantité supérieure au besoin restant");
            if(line.quantite()>stock) throw new BusinessException("Le stock a changé : quantité disponible insuffisante. Actualisez la proposition.");
            var b=beneficiaire(d.getBeneficiaireId());var a=new AffectationStock();a.setDemandeId(d.getId());a.setMaterielId(m.getId());a.setBeneficiaireId(b.getId());
            a.setBeneficiaireNom(b.getPrenom()+" "+b.getNom());a.setService(b.getService());a.setMaterielNom(m.getNom());a.setCategorie(categorie(m));a.setQuantite(line.quantite());a.setDateAffectation(LocalDateTime.now());
            a.setAdministrateur(audit.acteur());a.setStatut("ACTIVE");a.setRemarques(i.remarques());a.setCleOperation(key);affectations.saveAndFlush(a);stock-=line.quantite();
            statut(d);audit.noter("AFFECTATION_VALIDEE",m.getId(),d.getId(),a.getBeneficiaireNom()+" : "+line.quantite()+" ; "+i.remarques());result.add(a);
        }
        return result;
    }
    public AffectationStock annuler(Long id,Motif i) {
        var a=affectations.findById(id).orElseThrow(()->new ResourceNotFoundException("Affectation",id));
        verrouiller(a.getMaterielId());var d=demande(a.getDemandeId());
        entityManager.refresh(a,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if(!"ACTIVE".equals(a.getStatut())) throw new BusinessException("Cette affectation est déjà annulée");
        a.setStatut("ANNULEE");a.setDateAnnulation(LocalDateTime.now());a.setMotifAnnulation(i.motif());affectations.saveAndFlush(a);
        if(!List.of("REFUSEE","ANNULEE").contains(d.getStatut())) statut(d);
        audit.noter("AFFECTATION_ANNULEE",a.getMaterielId(),a.getDemandeId(),a.getQuantite()+" rendu(s) au stock : "+i.motif());return a;
    }
    @Transactional(readOnly=true)
    public Map<String,Object> vue() {
        var legacy=new ArrayList<Map<String,Object>>();
        for(var a:anciennes.findAll()) {
            Map<String,Object> row=new LinkedHashMap<>();row.put("id",a.getId());row.put("materielId",a.getMateriel().getId());row.put("materielNom",a.getMaterielNomSnapshot()==null?a.getMateriel().getNom():a.getMaterielNomSnapshot());row.put("categorie",a.getCategorieSnapshot()==null?categorie(a.getMateriel()):a.getCategorieSnapshot());
            row.put("beneficiaireNom",a.getBeneficiaireNomSnapshot()==null?a.getMembre().getPrenom()+" "+a.getMembre().getNom():a.getBeneficiaireNomSnapshot());row.put("membreId",a.getMembre().getId());row.put("quantite",a.getQuantite());row.put("dateAffectation",a.getDateAttribution());
            row.put("statut",a.isAnnule()?"ANNULEE":"ACTIVE");row.put("administrateur",a.getAdministrateur()==null?"Non renseigné (historique existant)":a.getAdministrateur());row.put("motifAnnulation",a.getMotifAnnulation());row.put("legacy",true);legacy.add(row);
        }
        return Map.of("materiels",inventaire.getAll(),"beneficiaires",beneficiaires.findAll(),"demandes",demandesClassees(),"affectations",affectations.findAll(),"anciennesAffectations",legacy,
            "receptions",receptions.findAll(),"journal",journal.findAllByOrderByDateOperationDesc(),"regles",lireRegles());
    }
}
