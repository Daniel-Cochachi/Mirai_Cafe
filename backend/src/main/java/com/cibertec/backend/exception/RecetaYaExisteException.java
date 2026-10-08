package com.cibertec.backend.exception;

public class RecetaYaExisteException extends RuntimeException {
    public RecetaYaExisteException(String mensaje) {
        super(mensaje);
    }
}
