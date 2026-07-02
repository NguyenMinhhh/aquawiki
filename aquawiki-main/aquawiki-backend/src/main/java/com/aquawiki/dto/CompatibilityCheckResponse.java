package com.aquawiki.dto;

import com.aquawiki.model.CompatibilityLevel;

import java.util.List;

public record CompatibilityCheckResponse(CompatibilityLevel groupResult, List<PairResult> pairs) {}
