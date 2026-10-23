package com.lias.lias_backend.controller;

import com.lias.lias_backend.model.*;
import com.lias.lias_backend.repository.*;
import com.lias.lias_backend.service.PrivatePdfStorage;
import com.lias.lias_backend.exception.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.time.*;
import java.util.*;

@RestController @RequestMapping("/api/reunions") @RequiredArgsConstructor
public class ReunionController {
    private final ReunionRepository repository;
    private final MembreRepository membres;
    private final PrivatePdfStorage files;
    public record Input(@NotBlank @Size(max=200) String titre, @Size(max=5000) String description,
        @NotNull LocalDateTime dateHeure, @Size(max=300) String lieu, @Size(max=1000) String lien, Set<Long> participants) {}
    private Membre member(Principal p) { return membres.findByEmail(p.getName()).orElseThrow(() -> new AccessDeniedException("Accès refusé")); }
    private boolean privileged(Membre m) { return m.getRole()==Membre.RoleMembre.ROLE_ADMIN || m.getRole()==Membre.RoleMembre.ROLE_DIRECTEUR; }
    private boolean visible(Reunion r, Membre m) { return privileged(m) || r.getParticipants().isEmpty() || r.getParticipants().contains(m.getId()); }
    private Reunion find(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Réunion", id)); }
    private Reunion authorized(Long id, Principal p) { Reunion r=find(id); if(!visible(r,member(p))) throw new AccessDeniedException("Accès refusé"); return r; }
    @GetMapping public List<Reunion> list(@RequestParam(defaultValue="") String q, @RequestParam(required=false) LocalDate date, Principal p) {
        Membre m=member(p);
        return repository.findAll().stream().filter(r->visible(r,m))
            .filter(r->r.getTitre().toLowerCase().contains(q.toLowerCase()))
            .filter(r->date==null || r.getDateHeure().toLocalDate().equals(date))
            .sorted(Comparator.comparing(Reunion::getDateHeure).reversed()).toList();
    }
    @GetMapping("/{id}") public Reunion get(@PathVariable Long id, Principal p) { return authorized(id,p); }
    private Reunion fill(Reunion r, Input i) {
        if ((i.lieu()==null || i.lieu().isBlank()) && (i.lien()==null || i.lien().isBlank())) throw new BusinessException("Indiquez un lieu ou un lien de visioconférence");
        if(i.lien()!=null && !i.lien().isBlank() && !i.lien().matches("https?://[^\\s]+")) throw new BusinessException("Lien HTTP ou HTTPS invalide");
        Set<Long> ids=i.participants()==null ? Set.of() : i.participants();
        if(membres.findAllById(ids).size()!=ids.size()) throw new BusinessException("Participant inconnu");
        r.setTitre(i.titre().trim()); r.setDescription(i.description()); r.setDateHeure(i.dateHeure()); r.setLieu(i.lieu()); r.setLien(i.lien()); r.setParticipants(new HashSet<>(ids)); return r;
    }
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')") public Reunion create(@Valid @RequestBody Input i) { return repository.save(fill(new Reunion(),i)); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')") public Reunion update(@PathVariable Long id,@Valid @RequestBody Input i) { return repository.save(fill(find(id),i)); }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')") public void delete(@PathVariable Long id) { Reunion r=find(id); repository.delete(r); files.delete(r.getPv()); }
    @PostMapping("/{id}/pv") @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR')") public Reunion upload(@PathVariable Long id,@RequestParam MultipartFile fichier) {
        Reunion r=find(id); String old=r.getPv(); String key=files.save(fichier);
        try { r.setPv(key); repository.save(r); } catch(RuntimeException e) { files.delete(key); throw e; }
        files.delete(old); return r;
    }
    @GetMapping("/{id}/pv") public ResponseEntity<Resource> download(@PathVariable Long id,Principal p) {
        Reunion r=authorized(id,p);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header("X-Content-Type-Options","nosniff")
            .header(HttpHeaders.CACHE_CONTROL,"no-store").header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"pv-"+id+".pdf\"").body(files.read(r.getPv()));
    }
}
