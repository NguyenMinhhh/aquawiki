package com.aquawiki.controller;

import com.aquawiki.dto.CompatibilityCheckRequest;
import com.aquawiki.dto.CompatibilityCheckResponse;
import com.aquawiki.service.CompatibilityService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compatibility")
public class CompatibilityController {

    private final CompatibilityService compatibilityService;

    public CompatibilityController(CompatibilityService compatibilityService) {
        this.compatibilityService = compatibilityService;
    }

    @PostMapping("/check")
    public CompatibilityCheckResponse check(@Valid @RequestBody CompatibilityCheckRequest request) {
        return compatibilityService.check(request.speciesIds());
    }
}
