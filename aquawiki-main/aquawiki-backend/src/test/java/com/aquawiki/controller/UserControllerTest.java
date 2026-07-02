package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.model.User;
import com.aquawiki.repository.UserRepository;
import com.aquawiki.service.JwtService;
import com.aquawiki.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void getMe_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void getMe_withValidUser_returnsUserInfo() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setDisplayName("Test User");
        user.setRole(User.Role.USER);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("user@example.com"))
            .andExpect(jsonPath("$.role").value("USER"));
    }
}
