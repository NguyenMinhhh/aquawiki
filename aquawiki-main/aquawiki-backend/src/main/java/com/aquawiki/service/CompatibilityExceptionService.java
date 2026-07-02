package com.aquawiki.service;

import com.aquawiki.dto.ExceptionRequest;
import com.aquawiki.dto.ExceptionResponse;
import com.aquawiki.dto.ExceptionUpdateRequest;
import com.aquawiki.model.SpeciesCompatibility;
import com.aquawiki.repository.SpeciesCompatibilityRepository;
import com.aquawiki.repository.SpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompatibilityExceptionService {

    private final SpeciesCompatibilityRepository repo;
    private final SpeciesRepository speciesRepo;

    public List<ExceptionResponse> listAll() {
        return repo.findAll().stream().map(ExceptionResponse::from).toList();
    }

    public ExceptionResponse create(ExceptionRequest req, String adminEmail) {
        long idA = Math.min(req.speciesAId(), req.speciesBId());
        long idB = Math.max(req.speciesAId(), req.speciesBId());

        if (idA == idB) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Species A and B must differ");
        }
        if (repo.findBySpeciesAIdAndSpeciesBId(idA, idB).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Exception for this pair already exists");
        }

        var speciesA = speciesRepo.findById(idA)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Species A not found"));
        var speciesB = speciesRepo.findById(idB)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Species B not found"));

        SpeciesCompatibility sc = new SpeciesCompatibility();
        sc.setSpeciesA(speciesA);
        sc.setSpeciesB(speciesB);
        sc.setLevel(req.level());
        sc.setNote(req.note());
        sc.setVerifiedBy(adminEmail);

        return ExceptionResponse.from(repo.save(sc));
    }

    public ExceptionResponse update(Long id, ExceptionUpdateRequest req) {
        SpeciesCompatibility sc = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exception not found"));
        sc.setLevel(req.level());
        sc.setNote(req.note());
        return ExceptionResponse.from(repo.save(sc));
    }

    public void delete(Long id) {
        SpeciesCompatibility sc = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exception not found"));
        repo.delete(sc);
    }
}
