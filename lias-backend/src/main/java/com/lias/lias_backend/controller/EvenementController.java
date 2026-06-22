package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.EvenementDTO;
import com.lias.lias_backend.service.EvenementService;
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
@RequestMapping("/api/evenements")
@RequiredArgsConstructor
public class EvenementController {

    private final EvenementService evenementService;

    @GetMapping
    public ResponseEntity<Page<EvenementDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(evenementService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvenementDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getById(id));
    }

    @GetMapping("/avenir")
    public ResponseEntity<List<EvenementDTO>> getAVenir() {
        return ResponseEntity.ok(evenementService.getEvenementsAVenir());
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<EvenementDTO>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(evenementService.rechercher(q));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<EvenementDTO> create(
            @Valid @RequestBody EvenementDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(evenementService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<EvenementDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody EvenementDTO dto) {
        return ResponseEntity.ok(evenementService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        evenementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
