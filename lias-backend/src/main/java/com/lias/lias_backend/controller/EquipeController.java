package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.AffiliationDTO;
import com.lias.lias_backend.dto.EquipeDTO;
import com.lias.lias_backend.dto.MandatDTO;
import com.lias.lias_backend.service.EquipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
@RequiredArgsConstructor
public class EquipeController {

    private final EquipeService equipeService;

    // ─── Équipes ─────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<EquipeDTO>> getAll() {
        return ResponseEntity.ok(equipeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(equipeService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<EquipeDTO> create(@RequestBody EquipeDTO dto) {
        return ResponseEntity.ok(equipeService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<EquipeDTO> update(@PathVariable Long id, @RequestBody EquipeDTO dto) {
        return ResponseEntity.ok(equipeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Affiliations ─────────────────────────────────────────

    @PostMapping("/{equipeId}/membres/{membreId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<AffiliationDTO> ajouterMembre(
            @PathVariable Long equipeId, @PathVariable Long membreId) {
        return ResponseEntity.ok(equipeService.ajouterMembre(equipeId, membreId));
    }

    @DeleteMapping("/affiliations/{affiliationId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<Void> retirerMembre(@PathVariable Long affiliationId) {
        equipeService.retirerMembre(affiliationId);
        return ResponseEntity.noContent().build();
    }

    // ─── Mandats ──────────────────────────────────────────────

    @GetMapping("/mandats")
    public ResponseEntity<List<MandatDTO>> getMandats() {
        return ResponseEntity.ok(equipeService.getMandats());
    }

    @PostMapping("/mandats")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<MandatDTO> ajouterMandat(@RequestBody MandatDTO dto) {
        return ResponseEntity.ok(equipeService.ajouterMandat(dto));
    }

    @DeleteMapping("/mandats/{mandatId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<Void> terminerMandat(@PathVariable Long mandatId) {
        equipeService.terminerMandat(mandatId);
        return ResponseEntity.noContent().build();
    }
}
