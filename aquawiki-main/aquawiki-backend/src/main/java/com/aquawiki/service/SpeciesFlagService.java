package com.aquawiki.service;

import com.aquawiki.dto.FlagRequest;
import com.aquawiki.dto.FlagResponse;
import com.aquawiki.model.FlagStatus;
import com.aquawiki.model.SpeciesFlag;
import com.aquawiki.repository.SpeciesFlagRepository;
import com.aquawiki.repository.SpeciesRepository;
import com.aquawiki.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpeciesFlagService {

    private final SpeciesFlagRepository flagRepo;
    private final SpeciesRepository speciesRepo;
    private final UserRepository userRepo;

    public void createFlag(Long speciesId, String reporterEmail, FlagRequest request) {
        var species = speciesRepo.findById(speciesId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Species not found"));

        var user = userRepo.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        SpeciesFlag flag = new SpeciesFlag();
        flag.setSpecies(species);
        flag.setReportedBy(user);
        flag.setReason(request.reason());

        flagRepo.save(flag);
    }

    public List<FlagResponse> listAll() {
        return flagRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(FlagResponse::from).toList();
    }

    public FlagResponse updateStatus(Long id, FlagStatus status) {
        SpeciesFlag flag = flagRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flag not found"));
        flag.setStatus(status);
        return FlagResponse.from(flagRepo.save(flag));
    }

    public long countPending() {
        return flagRepo.countByStatus(FlagStatus.PENDING);
    }
}
