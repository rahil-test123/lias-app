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
    private final com.lias.lias_backend.repository.DemandeAdhesionRepository demandes;
    private final com.lias.lias_backend.service.PrivatePdfStorage files;

    @PostMapping(consumes="multipart/form-data")
    public ResponseEntity<AdhesionDTO> soumettreFichier(@Valid @RequestPart("donnees") AdhesionDTO dto,
            @RequestPart(value="cv", required=false) org.springframework.web.multipart.MultipartFile cv) {
        if (dto.getPassword() == null || dto.getPassword().isBlank()) throw new BusinessException("Mot de passe obligatoire");
        return ResponseEntity.ok(adhesionService.soumettreAvecCv(dto, cv));
    }

    @GetMapping("/{id}/cv") @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<org.springframework.core.io.Resource> cv(@PathVariable Long id) {
        var d = demandes.findById(id).orElseThrow(() -> new com.lias.lias_backend.exception.ResourceNotFoundException("Demande", id));
        return ResponseEntity.ok().contentType(org.springframework.http.MediaType.APPLICATION_PDF)
            .header("Cache-Control", "no-store").header("X-Content-Type-Options", "nosniff")
            .header("Content-Disposition", "attachment; filename=\"cv-"+id+".pdf\"").body(files.read(d.getCv()));
    }

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

    @PostMapping(consumes="application/json")
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
