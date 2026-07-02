package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.service.JwtService;
import com.aquawiki.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void adminPing_withUserRole_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/ping"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void adminPing_withAdminRole_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/ping"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
