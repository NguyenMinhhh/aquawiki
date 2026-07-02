package com.aquawiki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tank_maintenance_log")
@Getter
@Setter
@NoArgsConstructor
public class TankMaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false)
    private Tank tank;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private MaintenanceEventType eventType;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
