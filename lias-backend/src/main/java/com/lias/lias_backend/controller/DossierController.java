package com.lias.lias_backend.controller;
import com.lias.lias_backend.repository.*;
import com.lias.lias_backend.service.PrivatePdfStorage;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import java.util.*;

@RestController @RequestMapping("/api/admin/dossiers") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class DossierController {
    private final MembreRepository membres;
    private final ReunionRepository reunions;
    private final DemandeAdhesionRepository demandes;
    private final PrivatePdfStorage files;
    @GetMapping public List<Map<String,Object>> list() {
        return membres.findAll().stream().map(m -> {
            Map<String,Object> row = new LinkedHashMap<>();
            row.put("id",m.getId()); row.put("nom",m.getNom()); row.put("prenom",m.getPrenom());
            row.put("email",m.getEmail()); row.put("role",m.getRole()); row.put("actif",m.isActif()); row.put("cvDisponible",m.getCv()!=null);
            return row;
        }).toList();
    }
    @GetMapping("/indicateurs") public Map<String,Long> stats() {
        long cv = java.util.stream.Stream.concat(membres.findAll().stream().map(m->m.getCv()), demandes.findAll().stream().map(d->d.getCv()))
            .filter(Objects::nonNull).distinct().count();
        return Map.of("utilisateurs",membres.count(),"cv",cv,
            "reunions",reunions.count(),"candidatures",demandes.count());
    }
    @GetMapping("/{id}/cv") public ResponseEntity<Resource> cv(@PathVariable Long id) {
        var m=membres.findById(id).orElseThrow(()->new ResourceNotFoundException("Membre",id));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header("Cache-Control","no-store")
            .header("X-Content-Type-Options","nosniff").header("Content-Disposition","attachment; filename=\"cv-membre-"+id+".pdf\"").body(files.read(m.getCv()));
    }
}
