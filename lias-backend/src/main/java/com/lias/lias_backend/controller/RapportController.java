package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.RapportDTO;
import com.lias.lias_backend.service.RapportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final RapportService rapportService;

    @GetMapping("/activite")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    public ResponseEntity<RapportDTO> getRapportActivite(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}") Integer annee) {
        return ResponseEntity.ok(rapportService.genererRapport(annee));
    }
}
