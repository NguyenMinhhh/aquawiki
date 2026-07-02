package com.aquawiki.controller;

import com.aquawiki.config.AuthEntryPoint;
import com.aquawiki.config.GlobalExceptionHandler;
import com.aquawiki.config.JwtAuthFilter;
import com.aquawiki.config.SecurityConfig;
import com.aquawiki.dto.PagedResponse;
import com.aquawiki.dto.SpeciesResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SpeciesController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})
class SpeciesControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean SpeciesService speciesService;
    @MockitoBean SpeciesFlagService flagService;
    @MockitoBean ImageStorageService imageStorageService;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserDetailsServiceImpl userDetailsService;

    private SpeciesResponse sampleResponse() {
        return new SpeciesResponse(1L, "Cá Betta", "Betta splendens", null,
                new BigDecimal("6.0"), new BigDecimal("8.0"),
                new BigDecimal("24.0"), new BigDecimal("30.0"),
                new BigDecimal("7.0"), "AGGRESSIVE", "EASY",
                "Mô tả cá betta", new BigDecimal("1.0"), "APPROVED",
                LocalDateTime.now());
    }

    @Test
    void getSpecies_noParams_returns200WithPagedResult() throws Exception {
        PagedResponse<SpeciesResponse> paged = new PagedResponse<>(List.of(sampleResponse()), 1L, 0, 20);
        when(speciesService.list(any(), any(), any(), any(), any(), any(), any(), eq(0), eq(20)))
                .thenReturn(paged);

        mockMvc.perform(get("/api/species"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.data[0].commonName").value("Cá Betta"));
    }

    @Test
    void getSpecies_withSearch_passesSearchParam() throws Exception {
        PagedResponse<SpeciesResponse> paged = new PagedResponse<>(List.of(sampleResponse()), 1L, 0, 20);
        when(speciesService.list(eq("betta"), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(paged);

        mockMvc.perform(get("/api/species?search=betta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].commonName").value("Cá Betta"));
    }

    @Test
    void getSpecies_noResults_returns200WithEmptyData() throws Exception {
        PagedResponse<SpeciesResponse> empty = new PagedResponse<>(List.of(), 0L, 0, 20);
        when(speciesService.list(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(empty);

        mockMvc.perform(get("/api/species?search=xyz123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void getSpeciesById_validId_returns200() throws Exception {
        when(speciesService.getById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/species/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.commonName").value("Cá Betta"))
                .andExpect(jsonPath("$.behaviorTag").value("AGGRESSIVE"));
    }

    @Test
    void getSpeciesById_notFound_returns404() throws Exception {
        when(speciesService.getById(999L))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Species not found"));

        mockMvc.perform(get("/api/species/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getSpecies_withBehaviorFilter_returns200() throws Exception {
        PagedResponse<SpeciesResponse> paged = new PagedResponse<>(List.of(sampleResponse()), 1L, 0, 20);
        when(speciesService.list(any(), eq("PEACEFUL"), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(paged);

        mockMvc.perform(get("/api/species?behaviorTag=PEACEFUL"))
                .andExpect(status().isOk());
    }
}
