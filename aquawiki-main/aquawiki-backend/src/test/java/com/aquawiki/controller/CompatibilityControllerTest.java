package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.dto.CompatibilityCheckRequest;
import com.aquawiki.dto.CompatibilityCheckResponse;
import com.aquawiki.model.CompatibilityLevel;
import com.aquawiki.service.CompatibilityService;
import com.aquawiki.service.JwtService;
import com.aquawiki.service.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CompatibilityController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class CompatibilityControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean CompatibilityService compatibilityService;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserDetailsServiceImpl userDetailsService;

    @Test
    void check_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/compatibility/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CompatibilityCheckRequest(List.of(1L, 2L)))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void check_singleSpecies_returnsCompatible() throws Exception {
        when(compatibilityService.check(any()))
                .thenReturn(new CompatibilityCheckResponse(CompatibilityLevel.COMPATIBLE, List.of()));

        mockMvc.perform(post("/api/compatibility/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CompatibilityCheckRequest(List.of(1L)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupResult").value("COMPATIBLE"))
                .andExpect(jsonPath("$.pairs").isEmpty());
    }

    @Test
    @WithMockUser
    void check_emptyList_returns400() throws Exception {
        mockMvc.perform(post("/api/compatibility/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CompatibilityCheckRequest(List.of()))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void check_validIds_returnsGroupResult() throws Exception {
        when(compatibilityService.check(any()))
                .thenReturn(new CompatibilityCheckResponse(CompatibilityLevel.INCOMPATIBLE, List.of()));

        mockMvc.perform(post("/api/compatibility/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CompatibilityCheckRequest(List.of(1L, 4L)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupResult").value("INCOMPATIBLE"));
    }
}
