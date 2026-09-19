package com.cibertec.backend.exception;

public class CredencialesInvalidasException extends RuntimeException{

    public CredencialesInvalidasException(String message) {
        super(message);
    }
}
