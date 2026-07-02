package com.aquawiki.controller;

import com.aquawiki.dto.TankRequest;
import com.aquawiki.dto.TankResponse;
import com.aquawiki.service.TankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tanks")
@RequiredArgsConstructor
public class TankController {

    private final TankService tankService;

    @GetMapping
    public List<TankResponse> list(Principal principal) {
        return tankService.list(principal.getName());
    }

    @GetMapping("/{id}")
    public TankResponse get(@PathVariable Long id, Principal principal) {
        return tankService.get(principal.getName(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TankResponse create(@Valid @RequestBody TankRequest request, Principal principal) {
        return tankService.create(principal.getName(), request);
    }

    @PutMapping("/{id}")
    public TankResponse update(@PathVariable Long id,
                               @Valid @RequestBody TankRequest request,
                               Principal principal) {
        return tankService.update(principal.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Principal principal) {
        tankService.delete(principal.getName(), id);
    }

    @PostMapping("/{id}/water-change")
    public TankResponse markWaterChange(@PathVariable Long id, Principal principal) {
        return tankService.markWaterChange(principal.getName(), id);
    }
}
