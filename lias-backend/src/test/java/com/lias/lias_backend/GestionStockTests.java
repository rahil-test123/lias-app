package com.lias.lias_backend;
import com.lias.lias_backend.dto.*;
import com.lias.lias_backend.dto.StockInputs.*;
import com.lias.lias_backend.model.*;
import com.lias.lias_backend.repository.*;
import com.lias.lias_backend.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @Transactional @org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class GestionStockTests {
    @Autowired GestionStockService gestion;
    @Autowired MaterielService inventaire;
    @Autowired DemandeMaterielRepository demandes;
    @Autowired AffectationStockRepository affectations;
    @Autowired MaterielRepository materiels;
    @Autowired AttributionMaterielRepository anciennes;
    @Autowired MembreRepository membres;
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    private String key() { return UUID.randomUUID().toString(); }
    private Long stock(int q) {
        var dto=new MaterielDTO();dto.setNom("Test stock "+key());dto.setCategorie("Test catégorie "+key());dto.setEtat("Neuf");dto.setQuantiteTotal(q);dto.setDateArrivage(LocalDate.now());
        return inventaire.create(dto).getId();
    }
    private DemandeMateriel demander(Long stock,int q) {
        var b=gestion.creerBeneficiaire(new Beneficiaire("Test","Bénéficiaire "+key(),"Service test",null));
        return gestion.enregistrerDemande(null,new Demande(b.getId(),stock,q,3,3,0,"Besoin pour test",LocalDate.now(),key()));
    }
    @SuppressWarnings("unchecked")
    private List<Ligne> lignes(Long id) {
        return ((List<Map<String,Object>>)gestion.proposer(id).get("lignes")).stream()
            .filter(r->(Integer)r.get("quantiteProposee")>0)
            .map(r->new Ligne(((DemandeMateriel)r.get("demande")).getId(),(Integer)r.get("quantiteProposee"))).toList();
    }
    @Test void quinzeDemandesDixOrdinateursPuisNouvelleReception() {
        Long id=stock(10);for(int i=0;i<15;i++) demander(id,1);
        var proposal=lignes(id);assertEquals(10,proposal.size());
        var input=new Validation(id,proposal,key(),"Distribution test");
        var saved=gestion.valider(input);assertEquals(10,saved.size());assertEquals(0,inventaire.getById(id).getQuantiteDisponible());
        var replay=gestion.valider(input);assertEquals(saved.stream().map(AffectationStock::getId).toList(),replay.stream().map(AffectationStock::getId).toList());
        assertEquals(5,demandes.findAll().stream().filter(d->d.getMaterielId().equals(id) && "EN_ATTENTE".equals(d.getStatut())).count());
        var receipt=new Reception(id,10,LocalDate.now(),"Nouveau lot",key());gestion.recevoir(receipt);gestion.recevoir(receipt);
        assertEquals(10,inventaire.getById(id).getQuantiteDisponible());assertEquals(5,lignes(id).size());
        gestion.valider(new Validation(id,lignes(id),key(),"Second lot"));
        assertEquals(5,inventaire.getById(id).getQuantiteDisponible());
        assertEquals(15,demandes.findAll().stream().filter(d->d.getMaterielId().equals(id) && "SATISFAITE".equals(d.getStatut())).count());
        var first=demandes.findById(proposal.get(0).demandeId()).orElseThrow();
        gestion.enregistrerDemande(null,new Demande(first.getBeneficiaireId(),id,1,5,5,0,"Nouveau besoin légitime",LocalDate.now(),key()));
        assertEquals(1,lignes(id).size(),"Un bénéficiaire déjà servi peut demander à nouveau");
    }
    @Test void demandePartielleAnnulationHistoriseeEtArchivage() {
        Long id=stock(1);var d=demander(id,3);
        var saved=gestion.valider(new Validation(id,List.of(new Ligne(d.getId(),1)),key(),"Partielle"));
        assertEquals("PARTIELLEMENT_SATISFAITE",demandes.findById(d.getId()).orElseThrow().getStatut());
        gestion.annuler(saved.get(0).getId(),new Motif("Retour physique vérifié"));
        assertEquals(1,inventaire.getById(id).getQuantiteDisponible());
        assertEquals("EN_ATTENTE",demandes.findById(d.getId()).orElseThrow().getStatut());
        assertEquals("ANNULEE",affectations.findById(saved.get(0).getId()).orElseThrow().getStatut());
        gestion.decision(d.getId(),new Decision("REFUSEE","Besoin non retenu"));
        inventaire.delete(id);
        assertTrue(materiels.findById(id).orElseThrow().isArchive());assertTrue(affectations.existsById(saved.get(0).getId()));assertTrue(demandes.existsById(d.getId()));
        gestion.restaurer(id);assertFalse(materiels.findById(id).orElseThrow().isArchive());
    }
    @Test void scoreValoriseBesoinAncienneteEtPenaliseSansExclure() {
        var r=new ReglesPrioriteMateriel();var d=new DemandeMateriel();d.setPriorite(3);d.setNecessite(5);d.setDateDemande(LocalDate.now().minusDays(10));
        long unserved=GestionStockService.score(d,r,0,LocalDate.now());
        assertTrue(unserved>GestionStockService.score(d,r,1,LocalDate.now()));
        d.setNecessite(1);assertTrue(unserved>GestionStockService.score(d,r,0,LocalDate.now()));
        r.setPenaliteDejaRecu(0);assertEquals(GestionStockService.score(d,r,0,LocalDate.now()),GestionStockService.score(d,r,10,LocalDate.now()));
    }
    @Test void anciennesAttributionsEtNouvellesAffectationsPartagentLeStock() {
        Long id=stock(2);var dto=new AttributionMaterielDTO();dto.setMaterielId(id);dto.setMembreId(membres.findAll().get(0).getId());dto.setQuantite(1);dto.setCleOperation(key());
        var old=inventaire.attribuer(dto);var replay=inventaire.attribuer(dto);assertEquals(old.getId(),replay.getId());
        var d=demander(id,2);gestion.valider(new Validation(id,List.of(new Ligne(d.getId(),1)),key(),"Nouveau parcours"));
        assertEquals(2,inventaire.getAttributionsByMateriel(id).size());
        assertEquals(1,inventaire.getAttributionsByMateriel(id).stream().filter(AttributionMaterielDTO::isGestionDemande).count());
        assertEquals(0,inventaire.getById(id).getQuantiteDisponible());
        inventaire.revoquerAttribution(old.getId(),"Retour du matériel historique");
        assertEquals(1,inventaire.getById(id).getQuantiteDisponible());assertTrue(anciennes.findById(old.getId()).orElseThrow().isAnnule());
    }
    @Test @org.springframework.security.test.context.support.WithMockUser(roles="DOCTORANT")
    void simpleMembreNePeutPasDistribuerNiLireLesDossiers() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/stock/vue"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isForbidden());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/stock/affectations/valider").contentType("application/json").content("{}"))
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isForbidden());
    }
}
