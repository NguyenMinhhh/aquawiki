package com.aquawiki.controller;

import com.aquawiki.dto.UserDto;
import com.aquawiki.model.User;
import com.aquawiki.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserDto(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name()
        ));
    }
}
