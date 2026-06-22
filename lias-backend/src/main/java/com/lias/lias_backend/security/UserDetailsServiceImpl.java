// Fichier : src/main/java/com/lias/lias_backend/security/UserDetailsServiceImpl.java
package com.lias.lias_backend.security;

import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final MembreRepository membreRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Membre non trouvé avec l'email: " + email));

        if (!membre.isActif()) {
            throw new UsernameNotFoundException("Compte désactivé: " + email);
        }

        return new User(
                membre.getEmail(),
                membre.getPassword(),
                List.of(new SimpleGrantedAuthority(membre.getRole().name()))
        );
    }
}