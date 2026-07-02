CREATE TABLE tanks (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                     BIGINT        NOT NULL,
    name                        VARCHAR(150)  NOT NULL,
    length_cm                   DECIMAL(7,1)  NOT NULL,
    width_cm                    DECIMAL(7,1)  NOT NULL,
    height_cm                   DECIMAL(7,1)  NOT NULL,
    volume_liters               DECIMAL(10,2) NOT NULL,
    water_change_interval_days  INT           NULL,
    last_water_change_date      DATE          NULL,
    created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tanks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tanks_user (user_id)
);
