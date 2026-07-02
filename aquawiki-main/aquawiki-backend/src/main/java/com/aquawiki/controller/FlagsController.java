package com.aquawiki.controller;

import com.aquawiki.dto.FlagResponse;
import com.aquawiki.dto.FlagStatusUpdateRequest;
import com.aquawiki.service.SpeciesFlagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/flags")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FlagsController {

    private final SpeciesFlagService flagService;

    @GetMapping
    public List<FlagResponse> list() {
        return flagService.listAll();
    }

    @GetMapping("/pending-count")
    public Map<String, Long> pendingCount() {
        return Map.of("count", flagService.countPending());
    }

    @PatchMapping("/{id}/status")
    public FlagResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody FlagStatusUpdateRequest request
    ) {
        return flagService.updateStatus(id, request.status());
    }
}
