package com.aquawiki.service;

import com.aquawiki.dto.AuthResponse;
import com.aquawiki.dto.LoginRequest;
import com.aquawiki.dto.RegisterRequest;
import com.aquawiki.model.User;
import com.aquawiki.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
        authService = new AuthService(userRepository, passwordEncoder, jwtService, authenticationManager);
    }

    @Test
    void register_withValidData_createsUserWithHashedPassword() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password123", "Test User");
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        User result = authService.register(request);

        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getRole()).isEqualTo(User.Role.USER);
        assertThat(passwordEncoder.matches("password123", result.getPasswordHash())).isTrue();
    }

    @Test
    void register_withDuplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest("dup@example.com", "password123", null);
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Email already registered");
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setRole(User.Role.USER);
        user.setDisplayName("User");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("mocked.jwt.token");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mock(Authentication.class));

        AuthResponse response = authService.login(new LoginRequest("user@example.com", "password123"));

        assertThat(response.token()).isEqualTo("mocked.jwt.token");
        assertThat(response.user().email()).isEqualTo("user@example.com");
        assertThat(response.user().role()).isEqualTo("USER");
    }

    @Test
    void login_withBadCredentials_throws401() {
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("bad@example.com", "wrong")))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Invalid email or password");
    }
}
