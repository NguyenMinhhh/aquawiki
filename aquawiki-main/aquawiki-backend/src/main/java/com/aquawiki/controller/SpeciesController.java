package com.aquawiki.controller;

import com.aquawiki.dto.*;
import com.aquawiki.service.ImageStorageService;
import com.aquawiki.service.SpeciesFlagService;
import com.aquawiki.service.SpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.Principal;

@RestController
@RequestMapping("/api/species")
@RequiredArgsConstructor
public class SpeciesController {

    private final SpeciesService speciesService;
    private final SpeciesFlagService flagService;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public PagedResponse<SpeciesResponse> list(
            Authentication auth,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String behaviorTag,
            @RequestParam(required = false) String careDifficulty,
            @RequestParam(required = false) BigDecimal phMin,
            @RequestParam(required = false) BigDecimal phMax,
            @RequestParam(required = false) BigDecimal tempMin,
            @RequestParam(required = false) BigDecimal tempMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return speciesService.listAll(search, behaviorTag, careDifficulty,
                    phMin, phMax, tempMin, tempMax, page, size);
        }
        return speciesService.list(search, behaviorTag, careDifficulty,
                phMin, phMax, tempMin, tempMax, page, size);
    }

    @GetMapping("/{id}")
    public SpeciesResponse getById(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return speciesService.getByIdForAdmin(id);
        }
        return speciesService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public SpeciesResponse create(@Valid @RequestBody SpeciesRequest request) {
        return speciesService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SpeciesResponse update(@PathVariable Long id,
                                  @Valid @RequestBody SpeciesRequest request) {
        return speciesService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public SpeciesResponse updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody StatusUpdateRequest request) {
        return speciesService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        speciesService.delete(id);
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SpeciesResponse uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String url = imageStorageService.store(id, file);
        return speciesService.updateImageUrl(id, url);
    }

    @PostMapping("/{id}/flags")
    @ResponseStatus(HttpStatus.CREATED)
    public void createFlag(
            @PathVariable Long id,
            @Valid @RequestBody FlagRequest request,
            Principal principal
    ) {
        flagService.createFlag(id, principal.getName(), request);
    }
}
