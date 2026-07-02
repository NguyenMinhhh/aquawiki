package com.aquawiki.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tank_species")
@Getter
@Setter
@NoArgsConstructor
public class TankSpecies {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tank_id", nullable = false)
    private Tank tank;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "species_id", nullable = false)
    private Species species;

    @Column(nullable = false)
    private Integer quantity = 1;
}
