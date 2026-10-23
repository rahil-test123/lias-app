package com.lias.lias_backend.config;

import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialise le compte administrateur en son absence.
 * Préserve les identifiants des comptes existants.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final MembreRepository membreRepository;
    private final PasswordEncoder  passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.bootstrap-admin.email:admin@lias.ma}")
    private String adminEmail;
    @org.springframework.beans.factory.annotation.Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        try {
            // Cherche par email d'abord, sinon par id=1
            Membre admin = membreRepository.findByEmail(adminEmail)
                    .orElseGet(() -> membreRepository.findById(1L).orElse(null));

            if (admin != null) {
                log.info("Compte administrateur existant conservé");
                return;
            } else {
                if (adminPassword == null || adminPassword.isBlank()) {
                    log.warn("Configurer app.bootstrap-admin.password pour créer le premier administrateur");
                    return;
                }
                log.warn("=== Aucun membre id=1 trouvé — création admin ===");
                Membre newAdmin = Membre.builder()
                        .nom("Msouhli")
                        .prenom("Rahil")
                        .email(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .statut(Membre.StatutMembre.PERMANENT)
                        .role(Membre.RoleMembre.ROLE_ADMIN)
                        .actif(true)
                        .build();
                membreRepository.save(newAdmin);
                log.info("Compte administrateur initial créé");
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation admin : {}", e.getMessage());
        }
    }
}
