package com.aquawiki.dto;

import java.util.List;

/** Response of POST /api/identify — ranked fish candidates with graceful no-match handling. */
public record IdentifyResponse(
        boolean noMatch,
        List<SpeciesMatch> candidates
) {
    public static IdentifyResponse of(List<SpeciesMatch> candidates) {
        return new IdentifyResponse(candidates.isEmpty(), candidates);
    }
}
