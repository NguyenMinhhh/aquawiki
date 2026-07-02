package com.aquawiki.dto;

import com.aquawiki.model.SpeciesFlag;

import java.time.LocalDateTime;

public record FlagResponse(
        Long id,
        SpeciesSummary species,
        String reportedByEmail,
        String reason,
        String status,
        LocalDateTime createdAt
) {
    public static FlagResponse from(SpeciesFlag f) {
        return new FlagResponse(
                f.getId(),
                SpeciesSummary.from(f.getSpecies()),
                f.getReportedBy().getEmail(),
                f.getReason(),
                f.getStatus().name(),
                f.getCreatedAt()
        );
    }
}
