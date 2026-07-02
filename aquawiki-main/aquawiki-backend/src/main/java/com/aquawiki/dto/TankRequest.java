package com.aquawiki.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TankRequest(
        @NotBlank(message = "Tên bể không được để trống")
        String name,

        @NotNull @DecimalMin(value = "0.1", message = "Chiều dài phải lớn hơn 0")
        BigDecimal lengthCm,

        @NotNull @DecimalMin(value = "0.1", message = "Chiều rộng phải lớn hơn 0")
        BigDecimal widthCm,

        @NotNull @DecimalMin(value = "0.1", message = "Chiều cao phải lớn hơn 0")
        BigDecimal heightCm,

        @Min(value = 1, message = "Chu kỳ thay nước phải ít nhất 1 ngày")
        Integer waterChangeIntervalDays,

        LocalDate lastWaterChangeDate,

        List<TankSpeciesItem> species
) {
    public record TankSpeciesItem(
            @NotNull Long speciesId,
            @NotNull @Min(value = 1, message = "Số lượng phải ít nhất 1") Integer quantity
    ) {}
}
