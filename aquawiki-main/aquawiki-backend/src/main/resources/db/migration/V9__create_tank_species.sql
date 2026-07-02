CREATE TABLE tank_species (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    tank_id     BIGINT NOT NULL,
    species_id  BIGINT NOT NULL,
    quantity    INT    NOT NULL DEFAULT 1,

    CONSTRAINT fk_tankspecies_tank FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tankspecies_species FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT uq_tank_species UNIQUE (tank_id, species_id),
    INDEX idx_tankspecies_tank (tank_id)
);
