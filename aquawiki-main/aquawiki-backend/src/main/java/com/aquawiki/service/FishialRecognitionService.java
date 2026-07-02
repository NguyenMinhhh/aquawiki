package com.aquawiki.service;

import com.aquawiki.dto.SpeciesMatch;
import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesStatus;
import com.aquawiki.repository.SpeciesRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Fishial.AI v2 provider for fish photo identification (Story 7.1).
 *
 * <p>Flow (per Fishial Cloud API v2):
 * <ol>
 *   <li>{@code POST /v2/auth} with client_id + client_secret → Bearer access_token (10-min TTL).</li>
 *   <li>{@code POST /v2/recognize} with Bearer token + raw image bytes (Content-Type = image mime)
 *       → objects[].species[].certainty + definitions{uuid → {commonName, scientificName}}.</li>
 * </ol>
 * Each detected species' scientific name is mapped to an APPROVED AquaWiki species; certainty
 * becomes the 0–1 confidence. Non-fish / unmatched photos yield an empty list (→ noMatch).
 */
@Service
@RequiredArgsConstructor
public class FishialRecognitionService implements SpeciesRecognitionService {

    private final SpeciesRepository speciesRepo;

    @Value("${aquawiki.fishial.enabled:false}")
    private boolean enabled;

    @Value("${aquawiki.fishial.base-url:https://api-recognition.fishial.ai/v2}")
    private String baseUrl;

    @Value("${aquawiki.fishial.client-id:}")
    private String clientId;

    @Value("${aquawiki.fishial.client-secret:}")
    private String clientSecret;

    // Cached Bearer token (TTL ~10 min; refresh a minute early).
    private volatile String cachedToken;
    private volatile Instant tokenExpiry = Instant.EPOCH;

    @Override
    public List<SpeciesMatch> identify(byte[] image, String mimeType) {
        if (!enabled || !StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Tính năng nhận diện cá chưa được cấu hình");
        }

        RecognizeResponse response;
        try {
            String token = authToken();
            response = client().post()
                    .uri("/recognize")
                    .header("Authorization", "Bearer " + token)
                    .contentType(mediaTypeFor(mimeType))
                    .body(image)
                    .retrieve()
                    .body(RecognizeResponse.class);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Dịch vụ nhận diện cá tạm thời không khả dụng");
        }

        return mapMatches(response);
    }

    private List<SpeciesMatch> mapMatches(RecognizeResponse response) {
        if (response == null || response.objects() == null || response.definitions() == null) {
            return List.of();
        }
        // Keep the highest confidence per AquaWiki species across all detected objects.
        Map<Long, SpeciesMatch> best = new LinkedHashMap<>();
        for (RecObject obj : response.objects()) {
            if (obj == null || obj.species() == null) continue;
            for (RecSpecies rs : obj.species()) {
                if (rs == null || rs.id() == null) continue;
                RecDefinition def = response.definitions().get(rs.id());
                if (def == null || !StringUtils.hasText(def.scientificName())) continue;

                speciesRepo.findFirstByScientificNameIgnoreCaseAndStatus(
                        def.scientificName().trim(), SpeciesStatus.APPROVED).ifPresent(s -> {
                    double conf = rs.certainty() == null ? 0.0 : Math.max(0.0, Math.min(1.0, rs.certainty()));
                    SpeciesMatch existing = best.get(s.getId());
                    if (existing == null || conf > existing.confidence()) {
                        best.put(s.getId(), new SpeciesMatch(
                                s.getId(), s.getCommonName(), s.getScientificName(), conf));
                    }
                });
            }
        }
        List<SpeciesMatch> matches = new ArrayList<>(best.values());
        matches.sort(Comparator.comparingDouble(SpeciesMatch::confidence).reversed());
        return matches;
    }

    private String authToken() {
        String token = cachedToken;
        if (token != null && Instant.now().isBefore(tokenExpiry)) {
            return token;
        }
        synchronized (this) {
            if (cachedToken != null && Instant.now().isBefore(tokenExpiry)) {
                return cachedToken;
            }
            AuthResponse auth;
            try {
                auth = client().post()
                        .uri("/auth")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("client_id", clientId, "client_secret", clientSecret))
                        .retrieve()
                        .body(AuthResponse.class);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Không xác thực được với dịch vụ nhận diện cá");
            }
            if (auth == null || !StringUtils.hasText(auth.accessToken())) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Không nhận được token từ dịch vụ nhận diện cá");
            }
            cachedToken = auth.accessToken();
            // Tokens last 600s; refresh 60s early.
            tokenExpiry = Instant.now().plusSeconds(540);
            return cachedToken;
        }
    }

    private RestClient client() {
        return RestClient.builder().baseUrl(baseUrl).build();
    }

    private MediaType mediaTypeFor(String mimeType) {
        if (StringUtils.hasText(mimeType)) {
            try {
                return MediaType.parseMediaType(mimeType);
            } catch (Exception ignored) {
                // fall through
            }
        }
        return MediaType.IMAGE_JPEG;
    }

    // ── Fishial v2 response shapes ──
    @JsonIgnoreProperties(ignoreUnknown = true)
    record AuthResponse(@JsonProperty("token_type") String tokenType,
                        @JsonProperty("access_token") String accessToken) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record RecognizeResponse(boolean ok, String queryToken,
                             List<RecObject> objects,
                             Map<String, RecDefinition> definitions) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record RecObject(List<RecSpecies> species) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record RecSpecies(String id, Double certainty) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record RecDefinition(String commonName, String scientificName, String imageUrl) {}
}
