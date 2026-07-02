CREATE TABLE species_flags (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    species_id           BIGINT NOT NULL,
    reported_by_user_id  BIGINT NOT NULL,
    reason               TEXT NOT NULL,
    status               ENUM('PENDING','REVIEWED','DISMISSED') NOT NULL DEFAULT 'PENDING',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_flag_species FOREIGN KEY (species_id)          REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT fk_flag_user    FOREIGN KEY (reported_by_user_id) REFERENCES users(id)   ON DELETE CASCADE,

    INDEX idx_flag_species (species_id),
    INDEX idx_flag_status  (status)
);
