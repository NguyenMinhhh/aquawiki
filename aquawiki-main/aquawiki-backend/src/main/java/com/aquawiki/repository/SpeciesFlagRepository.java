package com.aquawiki.repository;

import com.aquawiki.model.FlagStatus;
import com.aquawiki.model.SpeciesFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpeciesFlagRepository extends JpaRepository<SpeciesFlag, Long> {

    List<SpeciesFlag> findAllByOrderByCreatedAtDesc();

    long countByStatus(FlagStatus status);
}
