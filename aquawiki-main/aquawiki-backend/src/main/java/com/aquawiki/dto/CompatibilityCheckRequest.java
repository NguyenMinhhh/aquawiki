package com.aquawiki.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompatibilityCheckRequest(
        @NotEmpty(message = "Danh sách loài không được để trống")
        @Size(min = 1, max = 20, message = "Chỉ hỗ trợ từ 1 đến 20 loài")
        List<Long> speciesIds
) {}
