package com.aquawiki.service;

import com.aquawiki.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        // 256-bit base64 key (44 chars)
        String secret = "dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGFxdWF3aWtpIGp3dCBzaWduaW5n";
        jwtService = new JwtService(secret, 86400000L);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setRole(User.Role.USER);
    }

    @Test
    void generateToken_producesNonEmptyToken() {
        String token = jwtService.generateToken(testUser);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void validateToken_withValidToken_returnsTrue() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withInvalidToken_returnsFalse() {
        assertThat(jwtService.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@example.com");
    }

    @Test
    void validateToken_withExpiredToken_returnsFalse() {
        JwtService shortLivedService = new JwtService(
            "dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGFxdWF3aWtpIGp3dCBzaWduaW5n",
            -1000L
        );
        String token = shortLivedService.generateToken(testUser);
        assertThat(shortLivedService.validateToken(token)).isFalse();
    }
}
