package com.aquawiki.dto;

/** A single candidate species returned by AI recognition, resolved to an AquaWiki species. */
public record SpeciesMatch(
        Long speciesId,
        String commonName,
        String scientificName,
        double confidence
) {
}
