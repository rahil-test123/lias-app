package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.PublicationDTO;
import com.lias.lias_backend.service.PublicationService;
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
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    @GetMapping
    public ResponseEntity<Page<PublicationDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(publicationService.getAllPublications(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(publicationService.getById(id));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<PublicationDTO>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(publicationService.rechercher(q));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<PublicationDTO> create(
            @Valid @RequestBody PublicationDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(publicationService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<PublicationDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody PublicationDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(publicationService.update(id, dto, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        publicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
