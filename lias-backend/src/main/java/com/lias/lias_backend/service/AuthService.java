// Fichier : src/main/java/com/lias/lias_backend/service/AuthService.java
package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.LoginRequest;
import com.lias.lias_backend.dto.LoginResponse;
import com.lias.lias_backend.dto.MembreCreateDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.MembreRepository;
import com.lias.lias_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MembreRepository membreRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public LoginResponse login(LoginRequest request) {
        log.debug("Tentative de connexion pour: {}", request.getEmail());

        Membre membre = membreRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Email ou mot de passe incorrect"));

        if (!membre.isActif()) {
            throw new BusinessException("Compte désactivé. Contactez l'administrateur.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        log.info("Connexion réussie pour: {}", request.getEmail());

        return LoginResponse.builder()
                .token(token)
                .id(membre.getId())
                .email(membre.getEmail())
                .nom(membre.getNom())
                .prenom(membre.getPrenom())
                .role(membre.getRole().name())
                .statut(membre.getStatut().name())
                .build();
    }

    public Membre register(MembreCreateDTO dto) {
        log.debug("Création d'un nouveau membre: {}", dto.getEmail());

        if (membreRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé: " + dto.getEmail());
        }

        Membre membre = Membre.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .statut(dto.getStatut() != null ? dto.getStatut() : Membre.StatutMembre.DOCTORANT)
                .role(dto.getRole() != null ? dto.getRole() : Membre.RoleMembre.ROLE_DOCTORANT)
                .actif(true)
                .build();

        Membre saved = membreRepository.save(membre);
        log.info("Membre créé avec succès: {}", saved.getEmail());
        return saved;
    }
}