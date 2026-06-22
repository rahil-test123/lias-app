// Fichier : src/main/java/com/lias/lias_backend/exception/ResourceNotFoundException.java
package com.lias.lias_backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " non trouvé avec l'id: " + id);
    }
}