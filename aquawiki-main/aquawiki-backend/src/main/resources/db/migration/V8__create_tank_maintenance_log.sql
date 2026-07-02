CREATE TABLE tank_maintenance_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    tank_id     BIGINT       NOT NULL,
    event_type  ENUM('WATER_CHANGE','SPECIES_ADDED','TREATMENT','NOTE') NOT NULL,
    event_date  DATE         NOT NULL,
    note        VARCHAR(500),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_tank FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE,
    INDEX idx_maintenance_tank (tank_id)
);
