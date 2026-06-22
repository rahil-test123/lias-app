package com.lias.lias_backend.service;

import com.lias.lias_backend.dto.DocumentDTO;
import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import com.lias.lias_backend.model.Document;
import com.lias.lias_backend.model.Evenement;
import com.lias.lias_backend.model.Membre;
import com.lias.lias_backend.repository.DocumentRepository;
import com.lias.lias_backend.repository.EvenementRepository;
import com.lias.lias_backend.repository.MembreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MembreRepository membreRepository;
    private final EvenementRepository evenementRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getAll(Pageable pageable) {
        return documentRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getByMembre(Long membreId, Pageable pageable) {
        return documentRepository.findByMembreId(membreId, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> getByEvenement(Long evenementId) {
        return documentRepository.findByEvenementId(evenementId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDTO getById(Long id) {
        return toDTO(documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id)));
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> rechercher(String terme) {
        return documentRepository.rechercherDocuments(terme)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DocumentDTO upload(MultipartFile file, String titre, Long evenementId, String email) {
        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Membre non trouvé: " + email));

        if (file.isEmpty()) {
            throw new BusinessException("Le fichier est vide");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(uploadPath);
            Path targetPath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Erreur lors de l'upload du fichier: {}", e.getMessage());
            throw new BusinessException("Impossible de sauvegarder le fichier: " + e.getMessage());
        }

        Document.DocumentBuilder builder = Document.builder()
                .titre(titre != null ? titre : originalFilename)
                .type(file.getContentType())
                .cheminFichier(storedFilename)
                .membre(membre);

        if (evenementId != null) {
            Evenement evenement = evenementRepository.findById(evenementId)
                    .orElseThrow(() -> new ResourceNotFoundException("Evenement", evenementId));
            builder.evenement(evenement);
        }

        Document saved = documentRepository.save(builder.build());
        log.info("Document uploadé: {} par {}", saved.getTitre(), email);
        return toDTO(saved);
    }

    @Transactional
    public void delete(Long id, String email) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        Membre membre = membreRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Membre non trouvé: " + email));

        boolean isOwner = document.getMembre().getId().equals(membre.getId());
        boolean isAdmin = membre.getRole() == Membre.RoleMembre.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BusinessException("Vous n'êtes pas autorisé à supprimer ce document");
        }

        Path filePath = Paths.get(uploadDir).toAbsolutePath()
                .resolve(document.getCheminFichier());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Impossible de supprimer le fichier physique: {}", filePath);
        }

        documentRepository.deleteById(id);
        log.info("Document {} supprimé par {}", id, email);
    }

    public Resource loadAsResource(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath()
                    .resolve(document.getCheminFichier()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new BusinessException("Fichier introuvable sur le serveur");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException("Erreur d'accès au fichier: " + e.getMessage());
        }
    }

    public String getContentType(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        String type = document.getType();
        return (type != null && !type.isBlank()) ? type : "application/octet-stream";
    }

    public DocumentDTO toDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setTitre(doc.getTitre());
        dto.setType(doc.getType());
        dto.setCheminFichier(doc.getCheminFichier());
        dto.setDateUpload(doc.getDateUpload());
        if (doc.getMembre() != null) {
            dto.setMembreId(doc.getMembre().getId());
            dto.setMembreNom(doc.getMembre().getNom() + " " + doc.getMembre().getPrenom());
        }
        if (doc.getEvenement() != null) {
            dto.setEvenementId(doc.getEvenement().getId());
            dto.setEvenementTitre(doc.getEvenement().getTitre());
        }
        return dto;
    }
}
