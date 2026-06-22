// Fichier : src/main/java/com/lias/lias_backend/exception/BusinessException.java
package com.lias.lias_backend.exception;

public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}