package com.aquawiki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "species_flags")
@Getter
@Setter
@NoArgsConstructor
public class SpeciesFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "species_id", nullable = false)
    private Species species;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by_user_id", nullable = false)
    private User reportedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlagStatus status = FlagStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
