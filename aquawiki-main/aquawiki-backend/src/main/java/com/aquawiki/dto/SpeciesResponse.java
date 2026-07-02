package com.aquawiki.dto;

import com.aquawiki.model.Species;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SpeciesResponse(
        Long id,
        String commonName,
        String scientificName,
        String imageUrl,
        BigDecimal phMin,
        BigDecimal phMax,
        BigDecimal tempMin,
        BigDecimal tempMax,
        BigDecimal maxSizeCm,
        String behaviorTag,
        String careDifficulty,
        String description,
        BigDecimal bioloadFactor,
        String status,
        LocalDateTime createdAt
) {
    public static SpeciesResponse from(Species s) {
        return new SpeciesResponse(
                s.getId(),
                s.getCommonName(),
                s.getScientificName(),
                s.getImageUrl(),
                s.getPhMin(),
                s.getPhMax(),
                s.getTempMin(),
                s.getTempMax(),
                s.getMaxSizeCm(),
                s.getBehaviorTag().name(),
                s.getCareDifficulty().name(),
                s.getDescription(),
                s.getBioloadFactor(),
                s.getStatus().name(),
                s.getCreatedAt()
        );
    }
}
