package com.aquawiki.service;

import com.aquawiki.dto.SpeciesMatch;

import java.util.List;

/**
 * Abstraction over a fish-photo recognition provider (Story 7.1).
 * Default implementation: {@link FishialRecognitionService} (free, fish-only).
 * Claude vision (Spring AI) is a documented optional paid future augmentation — swap here.
 */
public interface SpeciesRecognitionService {

    /**
     * Identify fish in the given image, returning ranked candidate species
     * already resolved to existing AquaWiki species (ordered by confidence desc).
     * Returns an empty list when no confident fish match is found (→ noMatch).
     *
     * @throws org.springframework.web.server.ResponseStatusException 502/503 on provider failure
     */
    List<SpeciesMatch> identify(byte[] image, String mimeType);
}
