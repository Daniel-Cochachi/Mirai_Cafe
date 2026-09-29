package com.cibertec.backend.exception;

public class NombreDuplicadoException extends RuntimeException {
    public NombreDuplicadoException(String mensaje) {
        super(mensaje);
    }
}