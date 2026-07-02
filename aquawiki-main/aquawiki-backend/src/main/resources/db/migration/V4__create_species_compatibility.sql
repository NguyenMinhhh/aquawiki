CREATE TABLE species_compatibility (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    species_id_a BIGINT NOT NULL,
    species_id_b BIGINT NOT NULL,
    level        ENUM('COMPATIBLE', 'CAUTION', 'INCOMPATIBLE') NOT NULL,
    note         TEXT,
    verified_by  VARCHAR(100),
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_compat_a FOREIGN KEY (species_id_a) REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT fk_compat_b FOREIGN KEY (species_id_b) REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT chk_order   CHECK (species_id_a < species_id_b),
    CONSTRAINT uq_pair     UNIQUE (species_id_a, species_id_b),

    INDEX idx_compat_a (species_id_a),
    INDEX idx_compat_b (species_id_b)
);
