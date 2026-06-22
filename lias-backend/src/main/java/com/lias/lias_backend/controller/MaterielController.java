package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.AttributionMaterielDTO;
import com.lias.lias_backend.dto.MaterielDTO;
import com.lias.lias_backend.service.MaterielService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiels")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielService materielService;

    // ---------- Matériel ----------

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Page<MaterielDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(materielService.getAll(pageable));
    }

    @GetMapping("/liste")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<MaterielDTO>> getListe() {
        return ResponseEntity.ok(materielService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<MaterielDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.getById(id));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<MaterielDTO>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(materielService.rechercher(q));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<MaterielDTO> create(@Valid @RequestBody MaterielDTO dto) {
        return ResponseEntity.ok(materielService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<MaterielDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody MaterielDTO dto) {
        return ResponseEntity.ok(materielService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materielService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Attributions ----------

    @GetMapping("/attributions/membre/{membreId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<AttributionMaterielDTO>> getAttributionsByMembre(
            @PathVariable Long membreId) {
        return ResponseEntity.ok(materielService.getAttributionsByMembre(membreId));
    }

    @GetMapping("/{materielId}/attributions")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<List<AttributionMaterielDTO>> getAttributionsByMateriel(
            @PathVariable Long materielId) {
        return ResponseEntity.ok(materielService.getAttributionsByMateriel(materielId));
    }

    @PostMapping("/attributions")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<AttributionMaterielDTO> attribuer(
            @Valid @RequestBody AttributionMaterielDTO dto) {
        return ResponseEntity.ok(materielService.attribuer(dto));
    }

    @DeleteMapping("/attributions/{attributionId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<Void> revoquer(@PathVariable Long attributionId) {
        materielService.revoquerAttribution(attributionId);
        return ResponseEntity.noContent().build();
    }
}
