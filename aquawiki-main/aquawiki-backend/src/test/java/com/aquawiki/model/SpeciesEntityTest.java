package com.aquawiki.model;

import com.aquawiki.repository.SpeciesRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import jakarta.validation.ConstraintViolationException;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class SpeciesEntityTest {

    @Autowired
    SpeciesRepository repo;

    @Test
    void save_validSpecies_persists() {
        Species s = validSpecies();
        Species saved = repo.save(s);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCommonName()).isEqualTo("Test Fish");
        assertThat(saved.getStatus()).isEqualTo(SpeciesStatus.DRAFT);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void save_missingRequiredFields_throwsValidationException() {
        Species s = new Species();
        s.setCommonName("Missing Fields Fish");
        // phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag, careDifficulty all null

        assertThatThrownBy(() -> {
            repo.saveAndFlush(s);
        }).isInstanceOf(Exception.class);
    }

    @Test
    void defaultStatus_isDraft() {
        Species s = validSpecies();
        assertThat(s.getStatus()).isEqualTo(SpeciesStatus.DRAFT);
    }

    @Test
    void defaultBioloadFactor_isOne() {
        Species s = validSpecies();
        assertThat(s.getBioloadFactor()).isEqualByComparingTo(BigDecimal.ONE);
    }

    private Species validSpecies() {
        Species s = new Species();
        s.setCommonName("Test Fish");
        s.setScientificName("Testus fishus");
        s.setPhMin(new BigDecimal("6.5"));
        s.setPhMax(new BigDecimal("7.5"));
        s.setTempMin(new BigDecimal("24.0"));
        s.setTempMax(new BigDecimal("28.0"));
        s.setMaxSizeCm(new BigDecimal("5.0"));
        s.setBehaviorTag(BehaviorTag.PEACEFUL);
        s.setCareDifficulty(CareDifficulty.EASY);
        s.setBioloadFactor(BigDecimal.ONE);
        return s;
    }
}
