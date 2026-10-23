package com.lias.lias_backend.service;
import com.lias.lias_backend.model.JournalMateriel;
import com.lias.lias_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
@Service @RequiredArgsConstructor
public class JournalStockService {
    private final JournalMaterielRepository journal;
    private final MembreRepository membres;
    public String acteur() {
        var auth=SecurityContextHolder.getContext().getAuthentication();
        if(auth==null) return "Système";
        return membres.findByEmail(auth.getName()).map(m->m.getPrenom()+" "+m.getNom()+" ("+m.getEmail()+")").orElse(auth.getName());
    }
    public void noter(String action,Long materielId,Long demandeId,String details) {
        var j=new JournalMateriel();j.setAction(action);j.setMaterielId(materielId);j.setDemandeId(demandeId);
        j.setDateOperation(LocalDateTime.now());j.setAdministrateur(acteur());j.setDetails(details);journal.save(j);
    }
}
