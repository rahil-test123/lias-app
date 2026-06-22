package com.lias.lias_backend.controller;

import com.lias.lias_backend.dto.DocumentDTO;
import com.lias.lias_backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Page<DocumentDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(documentService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<DocumentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @GetMapping("/membre/{membreId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Page<DocumentDTO>> getByMembre(
            @PathVariable Long membreId, Pageable pageable) {
        return ResponseEntity.ok(documentService.getByMembre(membreId, pageable));
    }

    @GetMapping("/evenement/{evenementId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<DocumentDTO>> getByEvenement(@PathVariable Long evenementId) {
        return ResponseEntity.ok(documentService.getByEvenement(evenementId));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<DocumentDTO>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(documentService.rechercher(q));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<DocumentDTO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "evenementId", required = false) Long evenementId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                documentService.upload(file, titre, evenementId, userDetails.getUsername()));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = documentService.loadAsResource(id);
        String contentType = documentService.getContentType(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        documentService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
