package com.aquawiki.service;

import com.aquawiki.model.BehaviorTag;
import com.aquawiki.model.CompatibilityLevel;
import com.aquawiki.model.Species;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CompatibilityRuleEngine {

    public RuleResult evaluate(Species a, Species b) {
        List<RuleResult> results = new ArrayList<>();

        results.add(checkPh(a, b));
        results.add(checkTemperature(a, b));
        results.add(checkBehavior(a, b));
        results.add(checkPredatorSize(a, b));

        CompatibilityLevel worst = CompatibilityLevel.COMPATIBLE;
        List<String> reasons = new ArrayList<>();

        for (RuleResult r : results) {
            if (r.level().ordinal() > worst.ordinal()) {
                worst = r.level();
            }
            if (r.level() != CompatibilityLevel.COMPATIBLE && r.reason() != null) {
                reasons.add(r.reason());
            }
        }

        return new RuleResult(worst, reasons.isEmpty() ? null : String.join("; ", reasons));
    }

    private RuleResult checkPh(Species a, Species b) {
        boolean overlap = a.getPhMin().compareTo(b.getPhMax()) <= 0
                && a.getPhMax().compareTo(b.getPhMin()) >= 0;
        if (!overlap) {
            return new RuleResult(CompatibilityLevel.INCOMPATIBLE,
                    String.format("Xung đột pH: %s cần %.1f–%.1f, %s cần %.1f–%.1f",
                            a.getCommonName(), a.getPhMin(), a.getPhMax(),
                            b.getCommonName(), b.getPhMin(), b.getPhMax()));
        }
        return RuleResult.compatible();
    }

    private RuleResult checkTemperature(Species a, Species b) {
        boolean overlap = a.getTempMin().compareTo(b.getTempMax()) <= 0
                && a.getTempMax().compareTo(b.getTempMin()) >= 0;
        if (!overlap) {
            return new RuleResult(CompatibilityLevel.INCOMPATIBLE,
                    String.format("Xung đột nhiệt độ: %s cần %.0f–%.0f°C, %s cần %.0f–%.0f°C",
                            a.getCommonName(), a.getTempMin(), a.getTempMax(),
                            b.getCommonName(), b.getTempMin(), b.getTempMax()));
        }
        return RuleResult.compatible();
    }

    private RuleResult checkBehavior(Species a, Species b) {
        if (a.getBehaviorTag() == BehaviorTag.AGGRESSIVE && b.getBehaviorTag() == BehaviorTag.AGGRESSIVE) {
            return new RuleResult(CompatibilityLevel.CAUTION,
                    "Cả hai loài có tính hung hăng — có thể xảy ra xung đột lãnh thổ");
        }
        return RuleResult.compatible();
    }

    private RuleResult checkPredatorSize(Species a, Species b) {
        // A AGGRESSIVE, B quá nhỏ so với A
        if (a.getBehaviorTag() == BehaviorTag.AGGRESSIVE) {
            double threshold = a.getMaxSizeCm().doubleValue() * 0.3;
            if (b.getMaxSizeCm().doubleValue() < threshold) {
                return new RuleResult(CompatibilityLevel.INCOMPATIBLE,
                        String.format("Nguy cơ bị ăn: %s có thể coi %s là con mồi",
                                a.getCommonName(), b.getCommonName()));
            }
        }
        // B AGGRESSIVE, A quá nhỏ so với B
        if (b.getBehaviorTag() == BehaviorTag.AGGRESSIVE) {
            double threshold = b.getMaxSizeCm().doubleValue() * 0.3;
            if (a.getMaxSizeCm().doubleValue() < threshold) {
                return new RuleResult(CompatibilityLevel.INCOMPATIBLE,
                        String.format("Nguy cơ bị ăn: %s có thể coi %s là con mồi",
                                b.getCommonName(), a.getCommonName()));
            }
        }
        return RuleResult.compatible();
    }
}
