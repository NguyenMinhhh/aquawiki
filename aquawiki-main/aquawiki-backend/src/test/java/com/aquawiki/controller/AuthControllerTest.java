package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.dto.AuthResponse;
import com.aquawiki.dto.LoginRequest;
import com.aquawiki.dto.RegisterRequest;
import com.aquawiki.model.User;
import com.aquawiki.service.AuthService;
import com.aquawiki.service.JwtService;
import com.aquawiki.service.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    // --- Register tests ---

    @Test
    void register_withValidData_returns201() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(User.Role.USER);
        when(authService.register(any())).thenReturn(user);

        String body = objectMapper.writeValueAsString(
            new RegisterRequest("test@example.com", "password123", "Test"));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        when(authService.register(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered"));

        String body = objectMapper.writeValueAsString(
            new RegisterRequest("dup@example.com", "password123", null));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void register_withEmptyEmail_returns400() throws Exception {
        String body = objectMapper.writeValueAsString(
            new RegisterRequest("", "password123", null));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void register_withShortPassword_returns400() throws Exception {
        String body = objectMapper.writeValueAsString(
            new RegisterRequest("valid@example.com", "short", null));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    // --- Login tests ---

    @Test
    void login_withValidCredentials_returns200WithToken() throws Exception {
        AuthResponse response = new AuthResponse(
            "mocked.jwt.token",
            new AuthResponse.UserDto(1L, "user@example.com", "User", "USER")
        );
        when(authService.login(any())).thenReturn(response);

        String body = objectMapper.writeValueAsString(
            new LoginRequest("user@example.com", "password123"));

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
            .andExpect(jsonPath("$.user.email").value("user@example.com"))
            .andExpect(jsonPath("$.user.role").value("USER"));
    }

    @Test
    void login_withBadCredentials_returns401() throws Exception {
        when(authService.login(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String body = objectMapper.writeValueAsString(
            new LoginRequest("bad@example.com", "wrongpass"));

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
