// Fichier : src/main/java/com/lias/lias_backend/controller/MembreController.java
package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.MembreDTO;
import com.lias.lias_backend.dto.MembreProfilUpdateDTO;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.service.MembreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membres")
@RequiredArgsConstructor
public class MembreController {

    private final MembreService membreService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE')")
    public ResponseEntity<Page<MembreDTO>> getAllMembres(Pageable pageable) {
        return ResponseEntity.ok(membreService.getAllMembres(pageable));
    }

    @GetMapping("/actifs")
    public ResponseEntity<List<MembreDTO>> getMembresActifs() {
        return ResponseEntity.ok(membreService.getMembresActifs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembreDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(membreService.getMembreById(id));
    }

    @GetMapping("/profil")
    public ResponseEntity<MembreDTO> getMonProfil(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                membreService.getMembreByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profil")
    public ResponseEntity<MembreDTO> updateProfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MembreProfilUpdateDTO dto) {
        return ResponseEntity.ok(
                membreService.updateProfil(userDetails.getUsername(), dto));
    }

    @PutMapping("/{id}/toggle-actif")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembreDTO> toggleActif(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                membreService.toggleActif(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembreDTO> updateStatut(
            @PathVariable Long id,
            @RequestParam Membre.StatutMembre statut,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                membreService.updateStatut(id, statut, userDetails.getUsername()));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<MembreDTO>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(membreService.rechercher(q));
    }
}