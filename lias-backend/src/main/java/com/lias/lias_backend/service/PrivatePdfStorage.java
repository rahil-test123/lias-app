package com.lias.lias_backend.service;

import com.lias.lias_backend.exception.BusinessException;
import com.lias.lias_backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class PrivatePdfStorage {
    private final Path root;
    public PrivatePdfStorage(@Value("${app.upload.dir:uploads}") String directory) {
        root = Path.of(directory, "private").toAbsolutePath().normalize();
    }
    public String save(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5 * 1024 * 1024)
            throw new BusinessException("Un PDF de 5 Mo maximum est requis");
        if (file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".pdf"))
            throw new BusinessException("Seuls les fichiers PDF sont acceptés");
        try (var input = file.getInputStream()) {
            if (!java.util.Arrays.equals(input.readNBytes(5), "%PDF-".getBytes(java.nio.charset.StandardCharsets.US_ASCII)))
                throw new BusinessException("Le contenu du fichier n'est pas un PDF");
            Files.createDirectories(root);
            String key = UUID.randomUUID() + ".pdf";
            file.transferTo(root.resolve(key));
            return key;
        } catch (IOException e) { throw new BusinessException("Impossible d'enregistrer le PDF"); }
    }
    public Resource read(String key) {
        if (key == null || !key.matches("[0-9a-f-]{36}\\.pdf")) throw new ResourceNotFoundException("PDF indisponible");
        try {
            Path path = root.resolve(key).normalize();
            if (!path.startsWith(root) || !Files.isRegularFile(path)) throw new ResourceNotFoundException("PDF indisponible");
            return new UrlResource(path.toUri());
        } catch (java.net.MalformedURLException e) { throw new ResourceNotFoundException("PDF indisponible"); }
    }
    public void delete(String key) {
        if (key != null && key.matches("[0-9a-f-]{36}\\.pdf")) {
            try { Files.deleteIfExists(root.resolve(key)); } catch (IOException ignored) { }
        }
    }
}
