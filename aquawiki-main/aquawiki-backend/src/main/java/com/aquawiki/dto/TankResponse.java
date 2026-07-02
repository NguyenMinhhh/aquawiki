package com.aquawiki.dto;

import com.aquawiki.model.ReminderStatus;
import com.aquawiki.model.Tank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TankResponse(
        Long id,
        String name,
        BigDecimal lengthCm,
        BigDecimal widthCm,
        BigDecimal heightCm,
        BigDecimal volumeLiters,
        Integer waterChangeIntervalDays,
        LocalDate lastWaterChangeDate,
        LocalDate nextDueDate,
        ReminderStatus reminderStatus,
        List<TankSpeciesResponse> species
) {
    public record TankSpeciesResponse(SpeciesResponse species, int quantity) {}

    public static TankResponse from(Tank t, LocalDate today) {
        LocalDate nextDue = computeNextDue(t);
        List<TankSpeciesResponse> speciesList = t.getSpecies().stream()
                .map(ts -> new TankSpeciesResponse(SpeciesResponse.from(ts.getSpecies()), ts.getQuantity()))
                .toList();
        return new TankResponse(
                t.getId(),
                t.getName(),
                t.getLengthCm(),
                t.getWidthCm(),
                t.getHeightCm(),
                t.getVolumeLiters(),
                t.getWaterChangeIntervalDays(),
                t.getLastWaterChangeDate(),
                nextDue,
                computeStatus(nextDue, today),
                speciesList
        );
    }

    public static LocalDate computeNextDue(Tank t) {
        if (t.getWaterChangeIntervalDays() == null || t.getLastWaterChangeDate() == null) {
            return null;
        }
        return t.getLastWaterChangeDate().plusDays(t.getWaterChangeIntervalDays());
    }

    public static ReminderStatus computeStatus(LocalDate nextDue, LocalDate today) {
        if (nextDue == null) return ReminderStatus.OK;
        if (nextDue.isBefore(today)) return ReminderStatus.OVERDUE;
        if (nextDue.isEqual(today)) return ReminderStatus.DUE;
        return ReminderStatus.OK;
    }
}
