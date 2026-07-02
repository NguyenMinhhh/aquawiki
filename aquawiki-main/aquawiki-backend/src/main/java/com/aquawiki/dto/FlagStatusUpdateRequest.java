package com.aquawiki.dto;

import com.aquawiki.model.FlagStatus;
import jakarta.validation.constraints.NotNull;

public record FlagStatusUpdateRequest(@NotNull FlagStatus status) {}
