package com.aquawiki.dto;

import com.aquawiki.model.SpeciesStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull SpeciesStatus status) {}
