package com.lias.lias_backend.config;

import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garantit qu'il existe toujours un compte admin fonctionnel au démarrage.
 * Met à jour le mot de passe avec le vrai BCryptPasswordEncoder de Spring.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final MembreRepository membreRepository;
    private final PasswordEncoder  passwordEncoder;

    private static final String ADMIN_EMAIL = "rahil.msouhli123@gmail.com";
    private static final String ADMIN_PASSWORD = "Admin1234!";

    @Override
    public void run(String... args) {
        try {
            // Cherche par email d'abord, sinon par id=1
            Membre admin = membreRepository.findByEmail(ADMIN_EMAIL)
                    .orElseGet(() -> membreRepository.findById(1L).orElse(null));

            if (admin != null) {
                admin.setEmail(ADMIN_EMAIL);
                admin.setNom("Msouhli");
                admin.setPrenom("Rahil");
                admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                admin.setRole(Membre.RoleMembre.ROLE_ADMIN);
                admin.setActif(true);
                membreRepository.save(admin);
                log.info("=== ADMIN initialisé : {} / {} ===", ADMIN_EMAIL, ADMIN_PASSWORD);
            } else {
                log.warn("=== Aucun membre id=1 trouvé — création admin ===");
                Membre newAdmin = Membre.builder()
                        .nom("Msouhli")
                        .prenom("Rahil")
                        .email(ADMIN_EMAIL)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .statut(Membre.StatutMembre.PERMANENT)
                        .role(Membre.RoleMembre.ROLE_ADMIN)
                        .actif(true)
                        .build();
                membreRepository.save(newAdmin);
                log.info("=== ADMIN créé : {} / {} ===", ADMIN_EMAIL, ADMIN_PASSWORD);
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation admin : {}", e.getMessage());
        }
    }
}
