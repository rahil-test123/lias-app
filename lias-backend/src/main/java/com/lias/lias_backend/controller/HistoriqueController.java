package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.HistoriqueDTO;
import com.lias.lias_backend.model.HistoriqueAction;
import com.lias.lias_backend.repository.HistoriqueActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historique")
@RequiredArgsConstructor
public class HistoriqueController {

    private final HistoriqueActionRepository historiqueRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<HistoriqueDTO>> getAll(
            @PageableDefault(size = 20, sort = "dateAction", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
            historiqueRepository.findAll(pageable).map(this::toDTO)
        );
    }

    private HistoriqueDTO toDTO(HistoriqueAction h) {
        HistoriqueDTO dto = new HistoriqueDTO();
        dto.setId(h.getId());
        dto.setAction(h.getAction());
        dto.setDetails(h.getDetails());
        dto.setDateAction(h.getDateAction());
        if (h.getMembre() != null) {
            dto.setMembreId(h.getMembre().getId());
            dto.setMembreNom(h.getMembre().getPrenom() + " " + h.getMembre().getNom());
        }
        return dto;
    }
}
