package com.aquawiki.repository;

import com.aquawiki.model.SpeciesCompatibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpeciesCompatibilityRepository extends JpaRepository<SpeciesCompatibility, Long> {

    Optional<SpeciesCompatibility> findBySpeciesAIdAndSpeciesBId(Long idA, Long idB);
}
