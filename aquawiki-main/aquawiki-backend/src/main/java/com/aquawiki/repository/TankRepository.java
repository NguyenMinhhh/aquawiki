package com.aquawiki.repository;

import com.aquawiki.model.Tank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TankRepository extends JpaRepository<Tank, Long> {
    List<Tank> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Tank> findByIdAndUserId(Long id, Long userId);
}
