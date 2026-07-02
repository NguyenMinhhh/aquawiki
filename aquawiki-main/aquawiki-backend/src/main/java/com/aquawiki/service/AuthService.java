package com.aquawiki.service;

import com.aquawiki.dto.AuthResponse;
import com.aquawiki.dto.LoginRequest;
import com.aquawiki.dto.RegisterRequest;
import com.aquawiki.model.User;
import com.aquawiki.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, new AuthResponse.UserDto(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name()
        ));
    }
}
