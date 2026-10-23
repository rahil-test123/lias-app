package com.lias.lias_backend.controller;
import com.lias.lias_backend.dto.StockInputs.*;
import com.lias.lias_backend.service.GestionStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/stock") @RequiredArgsConstructor @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
public class GestionStockController {
    private final GestionStockService service;
    @GetMapping("/vue") public Object vue() { return service.vue(); }
    @PutMapping("/materiels/{id}/restaurer") public void restaurer(@PathVariable Long id) { service.restaurer(id); }
    @PostMapping("/beneficiaires") public Object beneficiaire(@Valid @RequestBody Beneficiaire i) { return service.creerBeneficiaire(i); }
    @PostMapping("/demandes") public Object creer(@Valid @RequestBody Demande i) { return service.enregistrerDemande(null,i); }
    @PutMapping("/demandes/{id}") public Object modifier(@PathVariable Long id,@Valid @RequestBody Demande i) { return service.enregistrerDemande(id,i); }
    @PutMapping("/demandes/{id}/decision") public Object decision(@PathVariable Long id,@Valid @RequestBody Decision i) { return service.decision(id,i); }
    @PutMapping("/demandes/{id}/ordre") public Object ordre(@PathVariable Long id,@Valid @RequestBody Ordre i) { return service.ordre(id,i); }
    @PostMapping("/receptions") public Object recevoir(@Valid @RequestBody Reception i) { return service.recevoir(i); }
    @GetMapping("/proposition/{id}") public Object proposer(@PathVariable Long id) { return service.proposer(id); }
    @PostMapping("/affectations/valider") public Object valider(@Valid @RequestBody Validation i) { return service.valider(i); }
    @PutMapping("/affectations/{id}/annuler") public Object annuler(@PathVariable Long id,@Valid @RequestBody Motif i) { return service.annuler(id,i); }
    @PutMapping("/regles") public Object regles(@Valid @RequestBody Regles i) { return service.modifierRegles(i); }
}
