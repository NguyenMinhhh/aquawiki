package com.aquawiki.controller;

import com.aquawiki.dto.ExceptionRequest;
import com.aquawiki.dto.ExceptionResponse;
import com.aquawiki.dto.ExceptionUpdateRequest;
import com.aquawiki.service.CompatibilityExceptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compatibility/exceptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CompatibilityExceptionController {

    private final CompatibilityExceptionService service;

    @GetMapping
    public List<ExceptionResponse> list() {
        return service.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExceptionResponse create(
            @Valid @RequestBody ExceptionRequest request,
            Authentication auth
    ) {
        return service.create(request, auth.getName());
    }

    @PutMapping("/{id}")
    public ExceptionResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ExceptionUpdateRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
