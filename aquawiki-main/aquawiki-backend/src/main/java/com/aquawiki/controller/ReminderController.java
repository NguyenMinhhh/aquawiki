package com.aquawiki.controller;

import com.aquawiki.dto.TankResponse;
import com.aquawiki.service.TankService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final TankService tankService;

    /** In-app reminders: tanks whose water change is DUE or OVERDUE (computed on read). */
    @GetMapping
    public List<TankResponse> reminders(Principal principal) {
        return tankService.reminders(principal.getName());
    }
}
