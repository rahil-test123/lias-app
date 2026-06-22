package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.AdhesionDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.model.DemandeAdhesion;
import com.lias.lias_backend.service.AdhesionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adhesions")
@RequiredArgsConstructor
public class AdhesionController {

    private final AdhesionService adhesionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<Page<AdhesionDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(adhesionService.getAll(pageable));
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<Page<AdhesionDTO>> getByStatut(
            @PathVariable DemandeAdhesion.StatutDemande statut,
            Pageable pageable) {
        return ResponseEntity.ok(adhesionService.getByStatut(statut, pageable));
    }

    @PostMapping
    public ResponseEntity<AdhesionDTO> soumettre(@Valid @RequestBody AdhesionDTO dto) {
        return ResponseEntity.ok(adhesionService.soumettre(dto));
    }

    @PutMapping("/{id}/traiter")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<AdhesionDTO> traiter(
            @PathVariable Long id,
            @RequestParam String statut,
            @AuthenticationPrincipal UserDetails userDetails) {
        AdhesionDTO result = switch (statut.toUpperCase()) {
            case "ACCEPTEE" -> adhesionService.valider(id, userDetails.getUsername());
            case "REFUSEE"  -> adhesionService.refuser(id, userDetails.getUsername());
            default -> throw new BusinessException("Statut invalide: " + statut);
        };
        return ResponseEntity.ok(result);
    }
}
