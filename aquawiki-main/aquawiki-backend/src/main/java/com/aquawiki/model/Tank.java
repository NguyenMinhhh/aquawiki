package com.aquawiki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tanks")
@Getter
@Setter
@NoArgsConstructor
public class Tank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "length_cm", nullable = false)
    private BigDecimal lengthCm;

    @Column(name = "width_cm", nullable = false)
    private BigDecimal widthCm;

    @Column(name = "height_cm", nullable = false)
    private BigDecimal heightCm;

    @Column(name = "volume_liters", nullable = false)
    private BigDecimal volumeLiters;

    @Column(name = "water_change_interval_days")
    private Integer waterChangeIntervalDays;

    @Column(name = "last_water_change_date")
    private LocalDate lastWaterChangeDate;

    @OneToMany(mappedBy = "tank", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TankSpecies> species = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
