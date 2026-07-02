package com.aquawiki.repository;

import com.aquawiki.model.TankMaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TankMaintenanceLogRepository extends JpaRepository<TankMaintenanceLog, Long> {
    List<TankMaintenanceLog> findByTankIdOrderByEventDateDescIdDesc(Long tankId);
}
