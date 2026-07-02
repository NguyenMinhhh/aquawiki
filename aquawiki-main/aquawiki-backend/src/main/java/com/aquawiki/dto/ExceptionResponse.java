package com.aquawiki.dto;

import com.aquawiki.model.SpeciesCompatibility;

import java.time.LocalDateTime;

public record ExceptionResponse(
        Long id,
        SpeciesSummary speciesA,
        SpeciesSummary speciesB,
        String level,
        String note,
        String verifiedBy,
        LocalDateTime createdAt
) {
    public static ExceptionResponse from(SpeciesCompatibility sc) {
        return new ExceptionResponse(
                sc.getId(),
                SpeciesSummary.from(sc.getSpeciesA()),
                SpeciesSummary.from(sc.getSpeciesB()),
                sc.getLevel().name(),
                sc.getNote(),
                sc.getVerifiedBy(),
                sc.getCreatedAt()
        );
    }
}
