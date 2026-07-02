package com.aquawiki.repository;

import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SpeciesRepository extends JpaRepository<Species, Long>,
        JpaSpecificationExecutor<Species> {

    boolean existsByCommonNameIgnoreCase(String commonName);

    Optional<Species> findFirstByScientificNameIgnoreCaseAndStatus(String scientificName, SpeciesStatus status);
}
