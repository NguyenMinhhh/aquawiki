package com.aquawiki.dto;

import com.aquawiki.model.CompatibilityLevel;

public record PairResult(
        SpeciesSummary speciesA,
        SpeciesSummary speciesB,
        CompatibilityLevel level,
        String reason,
        String source
) {}
