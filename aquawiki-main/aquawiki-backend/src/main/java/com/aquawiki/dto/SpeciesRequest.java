package com.aquawiki.dto;

import com.aquawiki.model.BehaviorTag;
import com.aquawiki.model.CareDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SpeciesRequest(
        @NotBlank @Size(max = 150) String commonName,
        @NotBlank @Size(max = 200) String scientificName,
        @NotNull BigDecimal phMin,
        @NotNull BigDecimal phMax,
        @NotNull BigDecimal tempMin,
        @NotNull BigDecimal tempMax,
        @NotNull @Positive BigDecimal maxSizeCm,
        @NotNull BehaviorTag behaviorTag,
        @NotNull CareDifficulty careDifficulty,
        String description,
        @NotNull @Positive BigDecimal bioloadFactor
) {}
