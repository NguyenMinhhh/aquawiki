package com.aquawiki.dto;

import com.aquawiki.model.CompatibilityLevel;
import jakarta.validation.constraints.NotNull;

public record ExceptionRequest(
        @NotNull Long speciesAId,
        @NotNull Long speciesBId,
        @NotNull CompatibilityLevel level,
        String note
) {}
