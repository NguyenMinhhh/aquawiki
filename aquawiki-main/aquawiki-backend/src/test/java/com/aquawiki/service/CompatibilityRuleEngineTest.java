package com.aquawiki.service;

import com.aquawiki.model.BehaviorTag;
import com.aquawiki.model.CareDifficulty;
import com.aquawiki.model.CompatibilityLevel;
import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CompatibilityRuleEngineTest {

    private CompatibilityRuleEngine engine;

    @BeforeEach
    void setUp() {
        engine = new CompatibilityRuleEngine();
    }

    private Species makeSpecies(String name, double phMin, double phMax,
                                double tempMin, double tempMax,
                                double maxSize, BehaviorTag behavior) {
        Species s = new Species();
        s.setCommonName(name);
        s.setScientificName(name + " sp.");
        s.setPhMin(BigDecimal.valueOf(phMin));
        s.setPhMax(BigDecimal.valueOf(phMax));
        s.setTempMin(BigDecimal.valueOf(tempMin));
        s.setTempMax(BigDecimal.valueOf(tempMax));
        s.setMaxSizeCm(BigDecimal.valueOf(maxSize));
        s.setBehaviorTag(behavior);
        s.setCareDifficulty(CareDifficulty.EASY);
        s.setBioloadFactor(BigDecimal.ONE);
        s.setStatus(SpeciesStatus.APPROVED);
        return s;
    }

    @Test
    void evaluate_overlappingPh_compatible() {
        Species a = makeSpecies("A", 6.0, 7.5, 24.0, 28.0, 5.0, BehaviorTag.PEACEFUL);
        Species b = makeSpecies("B", 7.0, 8.0, 24.0, 28.0, 5.0, BehaviorTag.PEACEFUL);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.COMPATIBLE);
    }

    @Test
    void evaluate_nonOverlappingTemperature_incompatible() {
        Species a = makeSpecies("Cá Lạnh", 6.5, 7.5, 10.0, 20.0, 5.0, BehaviorTag.PEACEFUL);
        Species b = makeSpecies("Cá Nhiệt Đới", 6.5, 7.5, 26.0, 30.0, 5.0, BehaviorTag.PEACEFUL);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.INCOMPATIBLE);
        assertThat(result.reason()).contains("Xung đột nhiệt độ");
    }

    @Test
    void evaluate_bothAggressive_caution() {
        Species a = makeSpecies("Cá Betta", 6.0, 8.0, 24.0, 30.0, 7.0, BehaviorTag.AGGRESSIVE);
        Species b = makeSpecies("Cichlid", 7.8, 8.5, 24.0, 28.0, 12.0, BehaviorTag.AGGRESSIVE);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.CAUTION);
        assertThat(result.reason()).contains("hung hăng");
    }

    @Test
    void evaluate_aggressivePredatorVsTinyPrey_incompatible() {
        // A là loài hung hăng lớn (30cm), B là loài nhỏ (2cm < 30 * 0.3 = 9cm)
        Species a = makeSpecies("Cá Lớn Hung", 6.5, 7.5, 24.0, 28.0, 30.0, BehaviorTag.AGGRESSIVE);
        Species b = makeSpecies("Cá Nhỏ", 6.5, 7.5, 24.0, 28.0, 2.0, BehaviorTag.PEACEFUL);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.INCOMPATIBLE);
        assertThat(result.reason()).contains("Nguy cơ bị ăn");
    }

    @Test
    void evaluate_allRulesPass_compatible() {
        Species a = makeSpecies("Guppy", 6.8, 7.8, 22.0, 28.0, 6.0, BehaviorTag.PEACEFUL);
        Species b = makeSpecies("Neon Tetra", 6.0, 7.0, 20.0, 26.0, 4.0, BehaviorTag.PEACEFUL);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.COMPATIBLE);
    }

    @Test
    void evaluate_predatorRuleSymmetric_bAttacksA() {
        // B là loài hung hăng lớn, A nhỏ
        Species a = makeSpecies("Cá Nhỏ", 6.5, 7.5, 24.0, 28.0, 1.5, BehaviorTag.PEACEFUL);
        Species b = makeSpecies("Cá Lớn Hung", 6.5, 7.5, 24.0, 28.0, 25.0, BehaviorTag.AGGRESSIVE);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.INCOMPATIBLE);
        assertThat(result.reason()).contains("Nguy cơ bị ăn");
    }

    @Test
    void evaluate_nonOverlappingPh_incompatible() {
        Species a = makeSpecies("Acid Fish", 5.5, 6.5, 24.0, 28.0, 5.0, BehaviorTag.PEACEFUL);
        Species b = makeSpecies("Alkaline Fish", 7.5, 8.5, 24.0, 28.0, 5.0, BehaviorTag.PEACEFUL);
        RuleResult result = engine.evaluate(a, b);
        assertThat(result.level()).isEqualTo(CompatibilityLevel.INCOMPATIBLE);
        assertThat(result.reason()).contains("Xung đột pH");
    }
}
