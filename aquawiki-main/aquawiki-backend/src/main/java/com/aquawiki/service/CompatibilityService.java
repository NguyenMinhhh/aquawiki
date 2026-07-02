package com.aquawiki.service;

import com.aquawiki.dto.CompatibilityCheckResponse;
import com.aquawiki.dto.PairResult;
import com.aquawiki.dto.SpeciesSummary;
import com.aquawiki.model.CompatibilityLevel;
import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesCompatibility;
import com.aquawiki.repository.SpeciesCompatibilityRepository;
import com.aquawiki.repository.SpeciesRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class CompatibilityService {

    private final SpeciesRepository speciesRepository;
    private final SpeciesCompatibilityRepository compatibilityRepository;
    private final CompatibilityRuleEngine ruleEngine;

    public CompatibilityService(SpeciesRepository speciesRepository,
                                SpeciesCompatibilityRepository compatibilityRepository,
                                CompatibilityRuleEngine ruleEngine) {
        this.speciesRepository = speciesRepository;
        this.compatibilityRepository = compatibilityRepository;
        this.ruleEngine = ruleEngine;
    }

    public CompatibilityCheckResponse check(List<Long> speciesIds) {
        List<Species> speciesList = speciesIds.stream()
                .map(id -> speciesRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Species not found: " + id)))
                .toList();

        if (speciesList.size() < 2) {
            return new CompatibilityCheckResponse(CompatibilityLevel.COMPATIBLE, List.of());
        }

        List<PairResult> pairs = new ArrayList<>();

        for (int i = 0; i < speciesList.size(); i++) {
            for (int j = i + 1; j < speciesList.size(); j++) {
                Species a = speciesList.get(i);
                Species b = speciesList.get(j);
                pairs.add(evaluatePair(a, b));
            }
        }

        CompatibilityLevel groupResult = pairs.stream()
                .map(PairResult::level)
                .max(Comparator.comparingInt(Enum::ordinal))
                .orElse(CompatibilityLevel.COMPATIBLE);

        return new CompatibilityCheckResponse(groupResult, pairs);
    }

    private PairResult evaluatePair(Species a, Species b) {
        // Normalize: id_a < id_b for exception table lookup
        long idA = Math.min(a.getId(), b.getId());
        long idB = Math.max(a.getId(), b.getId());

        Optional<SpeciesCompatibility> exception =
                compatibilityRepository.findBySpeciesAIdAndSpeciesBId(idA, idB);

        if (exception.isPresent()) {
            SpeciesCompatibility ex = exception.get();
            return new PairResult(
                    SpeciesSummary.from(a),
                    SpeciesSummary.from(b),
                    ex.getLevel(),
                    ex.getNote(),
                    "EXCEPTION"
            );
        }

        RuleResult ruleResult = ruleEngine.evaluate(a, b);
        return new PairResult(
                SpeciesSummary.from(a),
                SpeciesSummary.from(b),
                ruleResult.level(),
                ruleResult.reason(),
                "RULE_ENGINE"
        );
    }
}
