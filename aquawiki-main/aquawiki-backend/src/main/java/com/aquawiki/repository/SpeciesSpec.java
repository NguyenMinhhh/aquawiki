package com.aquawiki.repository;

import com.aquawiki.model.BehaviorTag;
import com.aquawiki.model.CareDifficulty;
import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesStatus;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class SpeciesSpec {

    private SpeciesSpec() {}

    public static Specification<Species> approved() {
        return (root, query, cb) ->
                cb.equal(root.get("status"), SpeciesStatus.APPROVED);
    }

    public static Specification<Species> searchByName(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("commonName")), pattern),
                cb.like(cb.lower(root.get("scientificName")), pattern)
        );
    }

    public static Specification<Species> hasBehaviorTag(String tag) {
        if (tag == null || tag.isBlank()) return null;
        BehaviorTag behaviorTag = BehaviorTag.valueOf(tag.toUpperCase());
        return (root, query, cb) -> cb.equal(root.get("behaviorTag"), behaviorTag);
    }

    public static Specification<Species> hasCareDifficulty(String difficulty) {
        if (difficulty == null || difficulty.isBlank()) return null;
        CareDifficulty care = CareDifficulty.valueOf(difficulty.toUpperCase());
        return (root, query, cb) -> cb.equal(root.get("careDifficulty"), care);
    }

    public static Specification<Species> phOverlaps(BigDecimal phMin, BigDecimal phMax) {
        if (phMin == null && phMax == null) return null;
        return (root, query, cb) -> {
            if (phMin != null && phMax != null) {
                return cb.and(
                        cb.lessThanOrEqualTo(root.get("phMin"), phMax),
                        cb.greaterThanOrEqualTo(root.get("phMax"), phMin)
                );
            } else if (phMin != null) {
                return cb.greaterThanOrEqualTo(root.get("phMax"), phMin);
            } else {
                return cb.lessThanOrEqualTo(root.get("phMin"), phMax);
            }
        };
    }

    public static Specification<Species> tempOverlaps(BigDecimal tempMin, BigDecimal tempMax) {
        if (tempMin == null && tempMax == null) return null;
        return (root, query, cb) -> {
            if (tempMin != null && tempMax != null) {
                return cb.and(
                        cb.lessThanOrEqualTo(root.get("tempMin"), tempMax),
                        cb.greaterThanOrEqualTo(root.get("tempMax"), tempMin)
                );
            } else if (tempMin != null) {
                return cb.greaterThanOrEqualTo(root.get("tempMax"), tempMin);
            } else {
                return cb.lessThanOrEqualTo(root.get("tempMin"), tempMax);
            }
        };
    }
}
