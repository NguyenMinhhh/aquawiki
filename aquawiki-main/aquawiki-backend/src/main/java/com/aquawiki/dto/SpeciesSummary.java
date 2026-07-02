package com.aquawiki.dto;

import com.aquawiki.model.Species;

public record SpeciesSummary(Long id, String commonName, String scientificName) {

    public static SpeciesSummary from(Species s) {
        return new SpeciesSummary(s.getId(), s.getCommonName(), s.getScientificName());
    }
}
