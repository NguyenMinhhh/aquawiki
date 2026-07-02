package com.aquawiki.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FlagRequest(
        @NotBlank(message = "Vui lòng mô tả vấn đề bạn phát hiện")
        @Size(max = 1000)
        String reason
) {}
