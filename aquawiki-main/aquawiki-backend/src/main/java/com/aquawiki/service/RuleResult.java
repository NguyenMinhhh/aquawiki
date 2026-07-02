package com.aquawiki.service;

import com.aquawiki.model.CompatibilityLevel;

public record RuleResult(CompatibilityLevel level, String reason) {

    public static RuleResult compatible() {
        return new RuleResult(CompatibilityLevel.COMPATIBLE, null);
    }
}
