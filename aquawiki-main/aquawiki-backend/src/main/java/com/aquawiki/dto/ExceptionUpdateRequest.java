package com.aquawiki.dto;

import com.aquawiki.model.CompatibilityLevel;
import jakarta.validation.constraints.NotNull;

public record ExceptionUpdateRequest(
        @NotNull CompatibilityLevel level,
        String note
) {}
