package com.aquawiki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "species_compatibility")
@Getter
@Setter
@NoArgsConstructor
public class SpeciesCompatibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id_a", nullable = false)
    private Species speciesA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id_b", nullable = false)
    private Species speciesB;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompatibilityLevel level;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
