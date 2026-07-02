package com.aquawiki.config;

import com.aquawiki.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex) {
        ApiError error = new ApiError(
            ex.getStatusCode().value(),
            ex.getStatusCode().toString(),
            ex.getReason()
        );
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .findFirst()
            .orElse("Validation failed");
        ApiError error = new ApiError(400, "BAD_REQUEST", message);
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        ApiError error = new ApiError(403, "FORBIDDEN", "Access denied");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(Exception ex) {
        ApiError error = new ApiError(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
