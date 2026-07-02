package com.aquawiki.service;

import com.aquawiki.dto.PagedResponse;
import com.aquawiki.dto.SpeciesRequest;
import com.aquawiki.dto.SpeciesResponse;
import com.aquawiki.model.Species;
import com.aquawiki.model.SpeciesStatus;
import com.aquawiki.repository.SpeciesRepository;
import com.aquawiki.repository.SpeciesSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SpeciesService {

    private final SpeciesRepository repo;

    public PagedResponse<SpeciesResponse> list(
            String search,
            String behaviorTag,
            String careDifficulty,
            BigDecimal phMin,
            BigDecimal phMax,
            BigDecimal tempMin,
            BigDecimal tempMax,
            int page,
            int size
    ) {
        Specification<Species> spec = Specification
                .where(SpeciesSpec.approved())
                .and(SpeciesSpec.searchByName(search))
                .and(SpeciesSpec.hasBehaviorTag(behaviorTag))
                .and(SpeciesSpec.hasCareDifficulty(careDifficulty))
                .and(SpeciesSpec.phOverlaps(phMin, phMax))
                .and(SpeciesSpec.tempOverlaps(tempMin, tempMax));

        PageRequest pageable = PageRequest.of(page, size, Sort.by("commonName").ascending());
        Page<Species> result = repo.findAll(spec, pageable);

        return new PagedResponse<>(
                result.getContent().stream().map(SpeciesResponse::from).toList(),
                result.getTotalElements(),
                page,
                size
        );
    }

    public PagedResponse<SpeciesResponse> listAll(
            String search,
            String behaviorTag,
            String careDifficulty,
            BigDecimal phMin,
            BigDecimal phMax,
            BigDecimal tempMin,
            BigDecimal tempMax,
            int page,
            int size
    ) {
        Specification<Species> spec = Specification
                .where(SpeciesSpec.searchByName(search))
                .and(SpeciesSpec.hasBehaviorTag(behaviorTag))
                .and(SpeciesSpec.hasCareDifficulty(careDifficulty))
                .and(SpeciesSpec.phOverlaps(phMin, phMax))
                .and(SpeciesSpec.tempOverlaps(tempMin, tempMax));

        PageRequest pageable = PageRequest.of(page, size, Sort.by("commonName").ascending());
        Page<Species> result = repo.findAll(spec, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(SpeciesResponse::from).toList(),
                result.getTotalElements(),
                page,
                size
        );
    }

    public SpeciesResponse getById(Long id) {
        return repo.findById(id)
                .filter(s -> s.getStatus() == SpeciesStatus.APPROVED)
                .map(SpeciesResponse::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
    }

    public SpeciesResponse getByIdForAdmin(Long id) {
        return repo.findById(id)
                .map(SpeciesResponse::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
    }

    public SpeciesResponse create(SpeciesRequest req) {
        Species s = new Species();
        mapRequest(s, req);
        s.setStatus(SpeciesStatus.APPROVED);
        return SpeciesResponse.from(repo.save(s));
    }

    public SpeciesResponse update(Long id, SpeciesRequest req) {
        Species s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
        mapRequest(s, req);
        return SpeciesResponse.from(repo.save(s));
    }

    public SpeciesResponse updateStatus(Long id, SpeciesStatus status) {
        Species s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
        s.setStatus(status);
        return SpeciesResponse.from(repo.save(s));
    }

    public SpeciesResponse updateImageUrl(Long id, String imageUrl) {
        Species s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
        s.setImageUrl(imageUrl);
        return SpeciesResponse.from(repo.save(s));
    }

    public void delete(Long id) {
        Species s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Species not found"));
        repo.delete(s);
    }

    private void mapRequest(Species s, SpeciesRequest req) {
        s.setCommonName(req.commonName());
        s.setScientificName(req.scientificName());
        s.setPhMin(req.phMin());
        s.setPhMax(req.phMax());
        s.setTempMin(req.tempMin());
        s.setTempMax(req.tempMax());
        s.setMaxSizeCm(req.maxSizeCm());
        s.setBehaviorTag(req.behaviorTag());
        s.setCareDifficulty(req.careDifficulty());
        s.setDescription(req.description());
        s.setBioloadFactor(req.bioloadFactor());
    }
}
