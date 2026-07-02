package com.aquawiki.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "species")
@Getter
@Setter
@NoArgsConstructor
public class Species {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "common_name", nullable = false, length = 150)
    private String commonName;

    @NotBlank
    @Size(max = 200)
    @Column(name = "scientific_name", nullable = false, length = 200)
    private String scientificName;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @NotNull
    @Column(name = "ph_min", nullable = false, precision = 4, scale = 2)
    private BigDecimal phMin;

    @NotNull
    @Column(name = "ph_max", nullable = false, precision = 4, scale = 2)
    private BigDecimal phMax;

    @NotNull
    @Column(name = "temp_min", nullable = false, precision = 4, scale = 1)
    private BigDecimal tempMin;

    @NotNull
    @Column(name = "temp_max", nullable = false, precision = 4, scale = 1)
    private BigDecimal tempMax;

    @NotNull
    @Column(name = "max_size_cm", nullable = false, precision = 5, scale = 1)
    private BigDecimal maxSizeCm;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "behavior_tag", nullable = false)
    private BehaviorTag behaviorTag;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "care_difficulty", nullable = false)
    private CareDifficulty careDifficulty;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "bioload_factor", nullable = false, precision = 4, scale = 2)
    private BigDecimal bioloadFactor = BigDecimal.ONE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpeciesStatus status = SpeciesStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
