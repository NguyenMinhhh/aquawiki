package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.dto.FlagRequest;
import com.aquawiki.service.ImageStorageService;
import com.aquawiki.service.JwtService;
import com.aquawiki.service.SpeciesFlagService;
import com.aquawiki.service.SpeciesService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SpeciesController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class SpeciesFlagControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean SpeciesService speciesService;
    @MockitoBean SpeciesFlagService flagService;
    @MockitoBean ImageStorageService imageStorageService;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserDetailsServiceImpl userDetailsService;

    @Test
    void createFlag_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/species/1/flags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new FlagRequest("Sai thông tin pH"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void createFlag_authenticated_returns201() throws Exception {
        doNothing().when(flagService).createFlag(anyLong(), anyString(), any());

        mockMvc.perform(post("/api/species/1/flags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new FlagRequest("Nhiệt độ ghi sai, nên là 26-30°C"))))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void createFlag_emptyReason_returns400() throws Exception {
        mockMvc.perform(post("/api/species/1/flags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new FlagRequest(""))))
                .andExpect(status().isBadRequest());
    }
}
