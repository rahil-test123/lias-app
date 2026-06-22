package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.AdhesionDTO;
import com.lias.lias_backend.dto.EvenementDTO;
import com.lias.lias_backend.dto.PublicationDTO;
import com.lias.lias_backend.service.AdhesionService;
import com.lias.lias_backend.service.EvenementService;
import com.lias.lias_backend.service.PublicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicationService publicationService;
    private final EvenementService evenementService;
    private final AdhesionService adhesionService;

    @GetMapping("/publications")
    public ResponseEntity<List<PublicationDTO>> getPublications() {
        return ResponseEntity.ok(publicationService.rechercher(""));
    }

    @GetMapping("/evenements")
    public ResponseEntity<List<EvenementDTO>> getEvenementsAVenir() {
        return ResponseEntity.ok(evenementService.getEvenementsAVenir());
    }

    @PostMapping("/adhesions")
    public ResponseEntity<AdhesionDTO> soumettreDemande(@Valid @RequestBody AdhesionDTO dto) {
        return ResponseEntity.ok(adhesionService.soumettre(dto));
    }
}
